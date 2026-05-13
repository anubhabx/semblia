import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function listSourceFiles(dir: string): string[] {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return [];

  return fs.readdirSync(fullDir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(fullDir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (entry.name === ".next" || entry.name === "node_modules") return [];
      return listSourceFiles(relativePath);
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) return [];
    return [relativePath.replaceAll("\\", "/")];
  });
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("live query policy", () => {
  it("keeps page and component queries behind hook-level hydration helpers", () => {
    const directQueryFiles = listSourceFiles("app")
      .concat(listSourceFiles("components"))
      .filter((file) =>
        /import\s*\{[^}]*\buseQuery\b[^}]*\}\s*from\s*["']@tanstack\/react-query["']/.test(
          read(file),
        ),
      );

    expect(directQueryFiles).toEqual([]);
  });

  it("requires API hook queries to opt into shared live-query options", () => {
    const filesMissingLiveOptions = listSourceFiles("hooks/api").filter(
      (file) => {
        const source = read(file);
        const queryCount = source.match(/\buseQuery\s*\(\s*\{/g)?.length ?? 0;
        if (queryCount === 0) return false;

        const liveOptionCount =
          source.match(/\.\.\.liveQueryOptions\(options\)/g)?.length ?? 0;

        return liveOptionCount < queryCount;
      },
    );

    expect(filesMissingLiveOptions).toEqual([]);
  });
});
