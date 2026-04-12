# CLAUDE.md

Session start checklist:
- Read `./memory/MEMORY.md`, `./memory/user.md`, and `./memory/decisions.md`.
- Read the relevant files in `.claude/rules/`.
- Codebase questions MUST follow the 3-level hierarchy in `.claude/rules/00-working-rules.md`:
  1. `python scripts/codesearch.py query "<question>"` — vector search (always first)
  2. `graphify-out/GRAPH_REPORT.md` — structure/relationships
  3. Raw file reads — last resort only

After writing or modifying any source file in `apps/web_v2`, `apps/api_v2`, or `packages`, always run:
```bash
python scripts/update-indexes.py
```

Hard constraints:
- Do not end a session before `pnpm build --filter web_v2` succeeds.
- In `apps/web_v2`, use `/v2/` endpoints only.
- In Next.js 16 routes/layouts, `params` is a Promise: always `await props.params`.
- Typecheck `web_v2` with `cd apps/web_v2 && pnpm exec tsc --noEmit`.

Next.js warning:
- Treat framework behavior as version-sensitive. Check docs in `node_modules/next/dist/docs/` when uncertain.
