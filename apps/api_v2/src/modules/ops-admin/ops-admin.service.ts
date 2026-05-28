import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Prisma } from "@workspace/database/prisma";
import type { Queue } from "bullmq";
import {
  EXPORT_DELIVERY_QUEUE,
  type ExportDeliveryJob,
} from "../exports/exports.service.js";
import {
  NATIVE_INTEGRATION_EXPORT_QUEUE,
  type NativeIntegrationDeliveryJob,
} from "../integrations/integrations.service.js";
import {
  OUTBOUND_WEBHOOK_QUEUE,
  type OutboundWebhookDeliveryJob,
} from "../outbound-webhooks/outbound-webhooks.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { QueueTelemetryService } from "../queueing/queue-telemetry.service.js";
import {
  DEFAULT_DELIVERY_ATTEMPTS,
  DEFAULT_DELIVERY_BACKOFF_MS,
  EMAIL_DELIVERY_QUEUE,
} from "../queueing/queueing.constants.js";
import type { EmailDeliveryJob } from "../email/email.types.js";

@Injectable()
export class OpsAdminService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly queueTelemetry: QueueTelemetryService,
    @Optional()
    @InjectQueue(EMAIL_DELIVERY_QUEUE)
    private readonly emailQueue?: Queue<EmailDeliveryJob>,
    @Optional()
    @InjectQueue(OUTBOUND_WEBHOOK_QUEUE)
    private readonly outboundWebhookQueue?: Queue<OutboundWebhookDeliveryJob>,
    @Optional()
    @InjectQueue(EXPORT_DELIVERY_QUEUE)
    private readonly exportDeliveryQueue?: Queue<ExportDeliveryJob>,
    @Optional()
    @InjectQueue(NATIVE_INTEGRATION_EXPORT_QUEUE)
    private readonly nativeIntegrationQueue?: Queue<NativeIntegrationDeliveryJob>,
  ) {}

  getStatus() {
    return {
      status: "ready",
      surface: "internal-only",
    } as const;
  }

  async getQueueSnapshot() {
    const today = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date();
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterday = yesterdayDate.toISOString().slice(0, 10);

    const [snapshot, todayUsage, yesterdayUsage, unresolvedAlertCount] =
      await Promise.all([
        this.queueTelemetry.getSnapshot(),
        this.prisma.client.emailUsage.findUnique({ where: { date: today } }),
        this.prisma.client.emailUsage.findUnique({
          where: { date: yesterday },
        }),
        this.prisma.client.alertHistory.count({
          where: { resolved: false },
        }),
      ]);

    return {
      ...snapshot,
      emailUsage: {
        today: { date: today, count: todayUsage?.count ?? 0 },
        yesterday: { date: yesterday, count: yesterdayUsage?.count ?? 0 },
      },
      unresolvedAlertCount,
    };
  }

  async retryDeadLetter(id: string) {
    const deadLetter = await this.prisma.client.deadLetterJob.findUnique({
      where: { id },
    });

    if (!deadLetter) {
      throw new NotFoundException("Dead-letter job not found");
    }

    if (deadLetter.retried) {
      return { retried: false, reason: "already_retried" as const };
    }

    const deliveryId = getDeliveryId(deadLetter.data);
    if (!deliveryId) {
      throw new BadRequestException("Dead-letter job is missing deliveryId");
    }

    const retry = this.getRetryTarget(deadLetter.queue, deadLetter.id, deliveryId);
    await retry.queue.add(retry.name, { deliveryId }, retry.options);

    const retriedAt = new Date();
    await this.prisma.client.deadLetterJob.update({
      where: { id: deadLetter.id },
      data: {
        retried: true,
        retriedAt,
        retryHistory: buildRetryHistory(deadLetter.retryHistory, {
          retriedAt: retriedAt.toISOString(),
          jobId: retry.options.jobId,
          queue: deadLetter.queue,
          deliveryId,
        }),
      },
    });

    return { retried: true, jobId: retry.options.jobId };
  }

  private getRetryTarget(queue: string, deadLetterId: string, deliveryId: string) {
    const commonOptions = {
      attempts: DEFAULT_DELIVERY_ATTEMPTS,
      backoff: { type: "exponential" as const, delay: DEFAULT_DELIVERY_BACKOFF_MS },
      removeOnComplete: true,
      removeOnFail: false,
    };

    if (queue === EMAIL_DELIVERY_QUEUE && this.emailQueue) {
      return {
        queue: this.emailQueue,
        name: "send",
        options: {
          ...commonOptions,
          jobId: `retry:email-delivery:${deadLetterId}:${deliveryId}`,
        },
      };
    }

    if (queue === OUTBOUND_WEBHOOK_QUEUE && this.outboundWebhookQueue) {
      return {
        queue: this.outboundWebhookQueue,
        name: "deliver",
        options: {
          ...commonOptions,
          jobId: `retry:outbound-webhook:${deadLetterId}:${deliveryId}`,
        },
      };
    }

    if (queue === EXPORT_DELIVERY_QUEUE && this.exportDeliveryQueue) {
      return {
        queue: this.exportDeliveryQueue,
        name: "csv",
        options: {
          ...commonOptions,
          jobId: `retry:export-delivery:${deadLetterId}:${deliveryId}`,
        },
      };
    }

    if (queue === NATIVE_INTEGRATION_EXPORT_QUEUE && this.nativeIntegrationQueue) {
      return {
        queue: this.nativeIntegrationQueue,
        name: "deliver",
        options: {
          ...commonOptions,
          jobId: `retry:native-integration-export:${deadLetterId}:${deliveryId}`,
        },
      };
    }

    throw new BadRequestException(`Unsupported dead-letter queue: ${queue}`);
  }
}

function getDeliveryId(data: Prisma.JsonValue) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const deliveryId = (data as Record<string, unknown>).deliveryId;
  return typeof deliveryId === "string" && deliveryId ? deliveryId : null;
}

function buildRetryHistory(
  existing: Prisma.JsonValue,
  entry: Record<string, string>,
) {
  const history = Array.isArray(existing) ? existing : [];
  return [...history, entry] as Prisma.InputJsonValue;
}
