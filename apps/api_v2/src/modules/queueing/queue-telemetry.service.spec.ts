import { describe, expect, it, vi } from "vitest";
import type { Queue } from "bullmq";
import { QueueTelemetryService } from "./queue-telemetry.service.js";
import type { PrismaService } from "../prisma/prisma.service.js";

function makeQueue(counts: Record<string, number>) {
  return {
    getJobCounts: vi.fn().mockResolvedValue(counts),
  } as unknown as Queue;
}

describe("QueueTelemetryService", () => {
  it("summarizes BullMQ counts and durable delivery counts", async () => {
    const now = new Date("2026-05-28T08:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const outboundQueue = makeQueue({ waiting: 1, active: 2, failed: 3 });
    const exportQueue = makeQueue({ waiting: 4, delayed: 5 });
    const integrationQueue = makeQueue({ completed: 6 });
    const emailQueue = makeQueue({ waiting: 7, active: 1 });
    const moderationQueue = makeQueue({ waiting: 8, failed: 2 });
    const prisma = {
      client: {
        outboundWebhookDelivery: {
          groupBy: vi.fn().mockResolvedValue([
            { status: "PENDING", _count: { _all: 2 } },
            { status: "FAILED", _count: { _all: 1 } },
          ]),
        },
        exportDelivery: {
          groupBy: vi.fn().mockResolvedValue([
            { status: "SUCCEEDED", _count: { _all: 3 } },
          ]),
        },
        emailDelivery: {
          groupBy: vi.fn().mockResolvedValue([
            { status: "PENDING", _count: { _all: 5 } },
          ]),
          findFirst: vi.fn().mockResolvedValue({
            createdAt: new Date("2026-05-28T07:58:30.000Z"),
          }),
        },
        submissionModerationRun: {
          groupBy: vi
            .fn()
            .mockResolvedValueOnce([
              { status: "ENQUEUED", _count: { _all: 4 } },
              { status: "SUPPRESSED", _count: { _all: 1 } },
            ])
            .mockResolvedValueOnce([
              { status: "FAILED", _count: { _all: 2 } },
            ]),
        },
        deadLetterJob: {
          count: vi.fn().mockResolvedValue(7),
        },
      },
    } as unknown as PrismaService;
    const service = new QueueTelemetryService(
      prisma,
      outboundQueue,
      exportQueue,
      integrationQueue,
      emailQueue,
      moderationQueue,
    );

    await expect(service.getSnapshot()).resolves.toEqual({
      queues: {
        "outbound-webhook-delivery": {
          waiting: 1,
          active: 2,
          delayed: 0,
          failed: 3,
          completed: 0,
        },
        "export-delivery": {
          waiting: 4,
          active: 0,
          delayed: 5,
          failed: 0,
          completed: 0,
        },
        "native-integration-export": {
          waiting: 0,
          active: 0,
          delayed: 0,
          failed: 0,
          completed: 6,
        },
        "email-delivery": {
          waiting: 7,
          active: 1,
          delayed: 0,
          failed: 0,
          completed: 0,
        },
        "submission-moderation": {
          waiting: 8,
          active: 0,
          delayed: 0,
          failed: 2,
          completed: 0,
        },
      },
      deliveries: {
        outboundWebhooks: { PENDING: 2, FAILED: 1 },
        exports: { SUCCEEDED: 3 },
        emails: { PENDING: 5 },
        moderationRuns: { ENQUEUED: 4, SUPPRESSED: 1 },
        moderationRunsLast24h: { FAILED: 2 },
        oldestPendingEmailDeliveryAgeSeconds: 90,
        deadLetterJobs: 7,
      },
    });
    vi.useRealTimers();
  });
});
