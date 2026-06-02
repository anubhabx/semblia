import { describe, expect, it } from "vitest";
import {
  normalizeAwsModerationLabel,
  resolveModerationDecision,
} from "./submission-moderation.policy.js";
import type { ModerationInput } from "./submission-moderation.types.js";

function input(overrides: Partial<ModerationInput> = {}): ModerationInput {
  return {
    artifactType: "TEXT",
    provider: "aws-comprehend",
    score: 0,
    flags: [],
    categories: {},
    existingStatus: "PENDING",
    verifiedTrust: false,
    autoApproveVerified: false,
    ...overrides,
  };
}

describe("resolveModerationDecision", () => {
  it("flags high-confidence severe content for review", () => {
    expect(
      resolveModerationDecision(
        input({ score: 0.94, flags: ["explicit_nudity"] }),
      ),
    ).toEqual({
      decision: "REVIEW",
      moderationStatus: "FLAGGED",
      reason: "Provider detected high-confidence severe content.",
      score: 0.94,
      flags: ["explicit_nudity"],
    });
  });

  it("keeps human rejections rejected", () => {
    expect(
      resolveModerationDecision(
        input({ existingStatus: "REJECTED", score: 0, flags: [] }),
      ),
    ).toMatchObject({
      decision: "REJECT",
      moderationStatus: "REJECTED",
      reason: "Submission was already rejected by a reviewer.",
    });
  });

  it("approves verified clean submissions when project policy allows it", () => {
    expect(
      resolveModerationDecision(
        input({
          score: 0.1,
          verifiedTrust: true,
          autoApproveVerified: true,
        }),
      ),
    ).toMatchObject({
      decision: "APPROVE",
      moderationStatus: "APPROVED",
      reason: "Verified submission passed moderation checks.",
    });
  });

  it("keeps clean unverified submissions pending", () => {
    expect(resolveModerationDecision(input({ score: 0.1 }))).toMatchObject({
      decision: "APPROVE",
      moderationStatus: "PENDING",
      reason: "Submission passed provider moderation checks.",
    });
  });

  it("flags medium-score provider results for human review", () => {
    expect(
      resolveModerationDecision(input({ score: 0.72, flags: [] })),
    ).toMatchObject({
      decision: "REVIEW",
      moderationStatus: "FLAGGED",
      reason: "Provider detected content that needs human review.",
    });
  });

  it("normalizes AWS moderation labels", () => {
    expect(normalizeAwsModerationLabel("  Explicit Nudity / Graphic  ")).toBe(
      "explicit_nudity_graphic",
    );
  });
});
