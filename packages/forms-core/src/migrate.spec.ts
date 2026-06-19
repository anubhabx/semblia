import { describe, expect, it } from "vitest";
import { migrateFormDoc, parseFormDoc } from "./migrate.js";
import { SCHEMA_VERSION } from "./version.js";

describe("parseFormDoc", () => {
  it("applies defaults to an empty doc", () => {
    const doc = parseFormDoc({});
    expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
    expect(doc.intent).toBe("CUSTOM");
    expect(doc.layoutPreset).toBe("centeredCard");
    expect(doc.content.submitButtonText).toBe("Submit");
  });
});

describe("migrateFormDoc", () => {
  it("stamps the current schema version onto an older doc", () => {
    const doc = migrateFormDoc({ schemaVersion: "4.2.0", intent: "REVIEW" });
    expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
    expect(doc.intent).toBe("REVIEW");
  });

  it("tolerates junk input by falling back to defaults", () => {
    expect(migrateFormDoc(null).schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrateFormDoc("nonsense").schemaVersion).toBe(SCHEMA_VERSION);
  });

  it("throws on a doc from a newer major than this package understands", () => {
    const nextMajor = `${Number(SCHEMA_VERSION.split(".")[0]) + 1}.0.0`;
    expect(() => migrateFormDoc({ schemaVersion: nextMajor })).toThrow(
      /Unsupported form schemaVersion/,
    );
  });
});
