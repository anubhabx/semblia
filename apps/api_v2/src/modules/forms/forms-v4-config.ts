import { UnprocessableEntityException } from "@nestjs/common";
import { createHash } from "node:crypto";
import type { Prisma } from "@workspace/database/prisma";
import {
  defaultFormDefinition,
  formDefinitionDocSchema,
  migrateFormDoc,
  publishedFormDocSchema,
  publishFormDefinition,
  type PublishedFormDoc,
} from "@workspace/forms-core/schema";
import { ZodError, type ZodIssue } from "zod";

export const LEGACY_STUDIO_DRAFT_MESSAGE =
  "draft predates forms v4 - recreate it in the new studio";

export type DefaultPublishedFormConfigInput = {
  brandName?: string | null;
  brandColor?: string | null;
};

export type BackfillFormsV4Prisma = {
  collectionForm: {
    findMany(args: {
      select: {
        id: true;
        projectId: true;
        slug: true;
        config: true;
      };
      orderBy: { createdAt: "asc" };
    }): Promise<
      Array<{
        id: string;
        projectId: string;
        slug: string | null;
        config: Prisma.JsonValue;
      }>
    >;
    update(args: {
      where: { id: string };
      data: { config: Prisma.InputJsonValue };
    }): Promise<unknown>;
  };
};

export type BackfillFormsV4Options = {
  dryRun?: boolean;
  log?: (message: string) => void;
};

export type BackfillFormsV4Summary = {
  scanned: number;
  skipped: number;
  updated: number;
  failed: number;
  failures: Array<{ id: string; error: string }>;
};

export function createDefaultPublishedFormConfig(
  input: DefaultPublishedFormConfigInput = {},
): PublishedFormDoc {
  return publishFormDefinition(
    defaultFormDefinition({
      brandName: input.brandName ?? undefined,
      brandColor: input.brandColor ?? undefined,
    }),
  );
}

export function publishFormConfigForWrite(raw: unknown): PublishedFormDoc {
  try {
    return publishFormDefinition(raw);
  } catch (error) {
    throw formConfigValidationError(error, "Invalid forms v4 config");
  }
}

export function publishStudioDraftConfig(raw: unknown): PublishedFormDoc {
  const candidate = toRecord(raw);
  if (candidate.schemaVersion === undefined) {
    throw new UnprocessableEntityException({
      message: LEGACY_STUDIO_DRAFT_MESSAGE,
    });
  }

  const definition = formDefinitionDocSchema.safeParse(candidate);
  if (!definition.success) {
    throw formConfigValidationError(
      definition.error,
      "Invalid forms v4 studio draft",
    );
  }

  return publishFormConfigForWrite(definition.data);
}

export function resolvePublishedFormConfig(raw: unknown): PublishedFormDoc {
  const published = publishedFormDocSchema.safeParse(raw);
  if (published.success) {
    return published.data;
  }

  try {
    return publishFormDefinition(migrateFormDoc(raw));
  } catch (error) {
    throw formConfigValidationError(error, "Stored form config is not migratable");
  }
}

export function getPublishedFormConfigEtag(config: PublishedFormDoc): string {
  return createHash("sha256").update(stableJsonStringify(config)).digest("hex");
}

export async function backfillFormsV4Configs(
  prisma: BackfillFormsV4Prisma,
  options: BackfillFormsV4Options = {},
): Promise<BackfillFormsV4Summary> {
  const log = options.log ?? (() => undefined);
  const summary: BackfillFormsV4Summary = {
    scanned: 0,
    skipped: 0,
    updated: 0,
    failed: 0,
    failures: [],
  };

  const forms = await prisma.collectionForm.findMany({
    select: {
      id: true,
      projectId: true,
      slug: true,
      config: true,
    },
    orderBy: { createdAt: "asc" },
  });

  for (const form of forms) {
    summary.scanned += 1;
    const label = `${form.projectId}/${form.slug ?? form.id}`;

    if (publishedFormDocSchema.safeParse(form.config).success) {
      summary.skipped += 1;
      log(`skip ${label}: already forms v4`);
      continue;
    }

    try {
      const published = resolvePublishedFormConfig(form.config);
      if (options.dryRun) {
        summary.updated += 1;
        log(`dry-run ${label}: would migrate to forms v4`);
        continue;
      }

      await prisma.collectionForm.update({
        where: { id: form.id },
        data: { config: published as unknown as Prisma.InputJsonValue },
      });
      summary.updated += 1;
      log(`updated ${label}: migrated to forms v4`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary.failed += 1;
      summary.failures.push({ id: form.id, error: message });
      log(`failed ${label}: ${message}`);
    }
  }

  return summary;
}

function formConfigValidationError(error: unknown, message: string) {
  if (error instanceof UnprocessableEntityException) {
    return error;
  }

  if (error instanceof ZodError) {
    return new UnprocessableEntityException({
      message,
      details: summarizeZodIssues(error.issues),
    });
  }

  return new UnprocessableEntityException({
    message,
    details: [error instanceof Error ? error.message : String(error)],
  });
}

function summarizeZodIssues(issues: ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function stableJsonStringify(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortJsonValue(child)]),
    );
  }

  return value;
}
