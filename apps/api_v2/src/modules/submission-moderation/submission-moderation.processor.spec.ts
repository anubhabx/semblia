import { describe, expect, it, vi } from "vitest";
import { SubmissionModerationProcessor } from "./submission-moderation.processor.js";

describe("SubmissionModerationProcessor", () => {
  it("forwards BullMQ jobs to the moderation service", async () => {
    const service = {
      processRun: vi.fn(async () => ({ id: "run_1" })),
    };
    const processor = new SubmissionModerationProcessor(service as never);

    await expect(
      processor.process({ data: { runId: "run_1" } } as never),
    ).resolves.toEqual({ id: "run_1" });

    expect(service.processRun).toHaveBeenCalledWith("run_1");
  });
});
