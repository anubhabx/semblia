import { describe, expect, it, vi } from "vitest";
import {
  backfillFormsV4Configs,
  createDefaultPublishedFormConfig,
} from "./forms-v4-config.js";

describe("forms v4 config helpers", () => {
  it("backfills legacy collection form configs and skips published v4 configs", async () => {
    const published = createDefaultPublishedFormConfig({ brandName: "Acme" });
    const legacy = {
      brandName: "Legacy Co",
      headline: "Tell us what worked",
      questions: [
        {
          id: "content",
          type: "textarea",
          label: "Your feedback",
          required: true,
        },
      ],
      tokens: { accent: "#0f766e" },
    };
    const update = vi.fn().mockResolvedValue({});
    const log = vi.fn();
    const prisma = {
      collectionForm: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "form_published",
            projectId: "project_1",
            slug: "published",
            config: published,
          },
          {
            id: "form_legacy",
            projectId: "project_1",
            slug: "legacy",
            config: legacy,
          },
          {
            id: "form_future",
            projectId: "project_1",
            slug: "future",
            config: { schemaVersion: 999 },
          },
        ]),
        update,
      },
    };

    const summary = await backfillFormsV4Configs(prisma, { log });

    expect(summary).toMatchObject({
      scanned: 3,
      skipped: 1,
      updated: 1,
      failed: 1,
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "form_legacy" },
      data: {
        config: expect.objectContaining({
          schemaVersion: 2,
          content: expect.objectContaining({
            brandName: "Legacy Co",
            headline: "Tell us what worked",
          }),
          derived: expect.any(Object),
        }),
      },
    });
    expect(summary.failures[0]).toMatchObject({ id: "form_future" });
    expect(log).toHaveBeenCalledWith(
      "skip project_1/published: already forms v4",
    );
  });

  it("supports dry-run without writing rows", async () => {
    const update = vi.fn();
    const prisma = {
      collectionForm: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "form_legacy",
            projectId: "project_1",
            slug: "legacy",
            config: {
              brandName: "Legacy Co",
              questions: [
                {
                  id: "content",
                  type: "textarea",
                  label: "Your feedback",
                },
              ],
            },
          },
        ]),
        update,
      },
    };

    const summary = await backfillFormsV4Configs(prisma, { dryRun: true });

    expect(summary).toMatchObject({ scanned: 1, updated: 1, failed: 0 });
    expect(update).not.toHaveBeenCalled();
  });
});
