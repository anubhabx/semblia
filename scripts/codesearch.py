# type: ignore
"""
Codebase vector search using ChromaDB + Ollama (nomic-embed-text).

Usage:
  python scripts/codesearch.py index              # index/re-index all source files
  python scripts/codesearch.py query "auth flow"  # find relevant files
  python scripts/codesearch.py status             # show index state

This is Claude's PRIMARY codebase exploration tool. Outputs file paths +
relevant snippets so Claude reads only what matters, not everything.
"""
import sys
import os
import json
import hashlib
import re
from pathlib import Path

# Fix Windows console encoding
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

REPO_ROOT = Path(__file__).parent.parent
STORE_DIR = REPO_ROOT / "vector-store"
MANIFEST_FILE = STORE_DIR / "manifest.json"
OLLAMA_MODEL = "nomic-embed-text"
OLLAMA_BASE_URL = "http://localhost:11434"

# Source directories to index (matches graphify scope)
SOURCE_DIRS = [
    "apps/web_v2",
    "apps/api_v2",
    "packages",
]

# Extensions to index
INCLUDE_EXTS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", ".json", ".md", ".css", ".scss",
}

# Paths to skip
SKIP_PATTERNS = [
    "node_modules", ".next", "dist", "build",
    ".graphifyignore", "vector-store", "graphify-out",
    "__pycache__", ".git",
    "pnpm-lock.yaml", "package-lock.json",
    "generated/prisma", "generated/client",
    # Large decorative/style files not useful for navigation
    "background-beams",
    "globals.css",
]

# Skip files larger than this (likely minified/generated)
MAX_FILE_BYTES = 150_000

CHUNK_SIZE = 120   # lines per chunk
CHUNK_OVERLAP = 15 # lines of overlap between chunks
TOP_K = 6          # results to return per query


def should_skip(path: Path) -> bool:
    # Normalize to forward slashes for cross-platform matching
    path_str = str(path).replace("\\", "/")
    parts = path.parts
    return any(skip in parts or skip in path_str for skip in SKIP_PATTERNS)


def iter_source_files():
    for src in SOURCE_DIRS:
        base = REPO_ROOT / src
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if (
                path.is_file()
                and path.suffix in INCLUDE_EXTS
                and not should_skip(path)
                and path.stat().st_size <= MAX_FILE_BYTES
            ):
                yield path


def chunk_file(path: Path):
    """Split a file into overlapping line chunks. Returns list of (chunk_text, start_line)."""
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return []
    lines = text.splitlines()
    if not lines:
        return []
    chunks = []
    i = 0
    while i < len(lines):
        chunk_lines = lines[i : i + CHUNK_SIZE]
        chunks.append(("\n".join(chunk_lines), i + 1))
        if i + CHUNK_SIZE >= len(lines):
            break
        i += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def file_hash(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def get_client():
    import chromadb
    STORE_DIR.mkdir(exist_ok=True)
    return chromadb.PersistentClient(path=str(STORE_DIR / "chroma"))


def get_collection(client):
    return client.get_or_create_collection(
        name="codebase",
        metadata={"hnsw:space": "cosine"},
    )


def embed(texts: list[str]) -> list[list[float]]:
    """Embed a list of texts using Ollama nomic-embed-text."""
    import ollama
    client = ollama.Client(host=OLLAMA_BASE_URL)
    results = []
    for text in texts:
        resp = client.embeddings(model=OLLAMA_MODEL, prompt=text)
        results.append(resp["embedding"])
    return results


def load_manifest() -> dict:
    if MANIFEST_FILE.exists():
        return json.loads(MANIFEST_FILE.read_text())
    return {}


def save_manifest(manifest: dict):
    STORE_DIR.mkdir(exist_ok=True)
    MANIFEST_FILE.write_text(json.dumps(manifest, indent=2))


def cmd_index(force: bool = False):
    """Index or incrementally update the vector store."""
    print("Scanning source files...")
    files = list(iter_source_files())
    print(f"Found {len(files)} files in {SOURCE_DIRS}")

    client = get_client()

    if force:
        print("Force mode: wiping existing collection...")
        try:
            client.delete_collection("codebase")
        except Exception:
            pass
        manifest = {}
    else:
        manifest = load_manifest()

    collection = get_collection(client)

    to_index = []
    for f in files:
        rel = str(f.relative_to(REPO_ROOT))
        h = file_hash(f)
        if force or manifest.get(rel) != h:
            to_index.append(f)

    if not to_index:
        print("All files up to date. Nothing to re-index.")
        return

    print(f"Indexing {len(to_index)} new/changed files...")

    indexed = 0
    skipped = 0
    for f in to_index:
        rel = str(f.relative_to(REPO_ROOT)).replace("\\", "/")
        chunks = chunk_file(f)
        if not chunks:
            skipped += 1
            continue

        # Remove old chunks for this file
        try:
            existing = collection.get(where={"source_file": rel})
            if existing["ids"]:
                collection.delete(ids=existing["ids"])
        except Exception:
            pass

        # Build chunk docs
        chunk_texts = []
        chunk_ids = []
        chunk_metas = []
        for chunk_text, start_line in chunks:
            chunk_id = f"{rel}::{start_line}"
            chunk_texts.append(chunk_text)
            chunk_ids.append(chunk_id)
            chunk_metas.append({
                "source_file": rel,
                "start_line": start_line,
                "file_ext": f.suffix,
            })

        # Trim chunks that would exceed nomic-embed-text's ~8192 token context
        # (~4 chars/token → ~24000 chars max, use 20000 to be safe)
        safe_texts = [t[:20000] for t in chunk_texts]

        try:
            embeddings = embed(safe_texts)
            collection.add(
                ids=chunk_ids,
                embeddings=embeddings,
                documents=chunk_texts,
                metadatas=chunk_metas,
            )
            manifest[str(f.relative_to(REPO_ROOT))] = file_hash(f)
            indexed += 1
            if indexed % 10 == 0:
                print(f"  {indexed}/{len(to_index)} files indexed...")
        except Exception as e:
            print(f"  WARN: skipped {rel}: {e}")
            skipped += 1

    save_manifest(manifest)
    print(f"\nDone. {indexed} files indexed, {skipped} skipped.")
    print(f"Total in store: {collection.count()} chunks")


def cmd_query(question: str):
    """Find the most relevant files for a question."""
    client = get_client()
    collection = get_collection(client)

    if collection.count() == 0:
        print("ERROR: Index is empty. Run: python scripts/codesearch.py index")
        sys.exit(1)

    try:
        q_embedding = embed([question])[0]
    except Exception as e:
        print(f"ERROR: Could not embed query. Is Ollama running? ({e})")
        print("Start Ollama: ollama serve")
        sys.exit(1)

    results = collection.query(
        query_embeddings=[q_embedding],
        n_results=min(TOP_K * 3, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    # Deduplicate by file, keep best-scoring chunk per file
    seen_files = {}
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        f = meta["source_file"]
        score = 1 - dist  # cosine similarity
        if f not in seen_files or score > seen_files[f]["score"]:
            seen_files[f] = {"score": score, "snippet": doc, "line": meta["start_line"]}

    # Sort by score, take top K
    ranked = sorted(seen_files.items(), key=lambda x: -x[1]["score"])[:TOP_K]

    print(f"Query: {question}")
    print(f"Top {len(ranked)} relevant files:\n")
    output = []
    for i, (filepath, info) in enumerate(ranked, 1):
        score_pct = int(info["score"] * 100)
        snippet_preview = info["snippet"][:300].replace("\n", " ").strip()
        line = info["line"]
        print(f"{i}. {filepath}:{line}  [{score_pct}% match]")
        print(f"   {snippet_preview}...")
        print()
        output.append({"file": filepath, "line": line, "score": score_pct, "snippet": info["snippet"]})

    # Machine-readable output for programmatic use
    result_file = STORE_DIR / "last_query.json"
    result_file.write_text(json.dumps({"question": question, "results": output}, indent=2))

    return output


def cmd_status():
    """Show index status."""
    manifest = load_manifest()
    files = list(iter_source_files())
    indexed = len(manifest)
    total = len(files)
    stale = sum(
        1 for f in files
        if manifest.get(str(f.relative_to(REPO_ROOT))) != file_hash(f)
    )

    try:
        client = get_client()
        collection = get_collection(client)
        chunks = collection.count()
    except Exception:
        chunks = 0

    print(f"Vector store status:")
    print(f"  Files indexed : {indexed} / {total}")
    print(f"  Stale files   : {stale} (run 'index' to update)")
    print(f"  Chunks stored : {chunks}")
    print(f"  Store path    : {STORE_DIR / 'chroma'}")
    print(f"  Ollama model  : {OLLAMA_MODEL}")

    try:
        import ollama
        c = ollama.Client(host=OLLAMA_BASE_URL)
        models = [m.model for m in c.list().models]
        available = OLLAMA_MODEL in models or any(OLLAMA_MODEL in m for m in models)
        print(f"  Ollama status : {'ready' if available else 'model not pulled yet'}")
    except Exception as e:
        print(f"  Ollama status : not reachable ({e})")
        print("  -> Start with: ollama serve")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] == "status":
        cmd_status()
    elif args[0] == "index":
        force = "--force" in args
        cmd_index(force=force)
    elif args[0] == "query":
        if len(args) < 2:
            print("Usage: python scripts/codesearch.py query \"your question\"")
            sys.exit(1)
        cmd_query(" ".join(args[1:]))
    else:
        print(__doc__)
        sys.exit(1)
