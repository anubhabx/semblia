import {
  formDefinitionDocSchema,
  type FormDefinitionDoc,
} from "./schema/definition.js";
import { SCHEMA_VERSION } from "./version.js";

/**
 * Project a stored (possibly older) form doc forward to the current schema.
 *
 * The rebuild starts at schemaVersion 5; there are no prior v5 docs to migrate,
 * so this currently parses + applies defaults. Future breaking changes add a
 * branch here that upgrades the prior shape before parsing. Unknown future
 * versions throw loudly rather than silently mis-parsing.
 */
export function migrateFormDoc(raw: unknown): FormDefinitionDoc {
  const input: Record<string, unknown> =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const version =
    typeof input.schemaVersion === "string" ? input.schemaVersion : undefined;

  if (version) {
    const major = Number.parseInt(version.split(".")[0] ?? "", 10);
    const currentMajor = Number.parseInt(SCHEMA_VERSION.split(".")[0] ?? "", 10);
    if (Number.isFinite(major) && major > currentMajor) {
      throw new Error(
        `Unsupported form schemaVersion ${version} (newer than ${SCHEMA_VERSION})`,
      );
    }
  }

  return formDefinitionDocSchema.parse({ ...input, schemaVersion: SCHEMA_VERSION });
}

/** Parse + normalize a draft doc, applying all defaults. Throws on invalid input. */
export function parseFormDoc(raw: unknown): FormDefinitionDoc {
  return formDefinitionDocSchema.parse(raw ?? {});
}
