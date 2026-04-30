import { createHash } from "node:crypto";
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import type { Prisma } from "@workspace/database/prisma";
import { PrismaService } from "../prisma/prisma.service.js";
import type { ClerkWebhookEventDto } from "../users/users.dto.js";
import { UsersService } from "../users/users.service.js";
import type { RazorpayWebhookBodyDto } from "./webhooks.dto.js";

@Injectable()
export class WebhooksService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  async handleRazorpayWebhook(input: {
    body: RazorpayWebhookBodyDto;
    rawBody: Buffer | string;
  }): Promise<{ received: true; replayed: boolean }> {
    const rawBody = this.toRawBodyString(input.rawBody);
    const providerEventId = this.buildRazorpayProviderEventId(
      input.body.event,
      input.body.created_at,
      rawBody,
    );

    try {
      await this.prisma.client.paymentWebhookEvent.create({
        data: {
          provider: "razorpay",
          providerEventId,
          eventType: input.body.event,
          payload: input.body as Prisma.InputJsonValue,
          status: "received",
          receivedAt: new Date(),
          processedAt: null,
        },
      });
      return { received: true, replayed: false };
    } catch (error: unknown) {
      if (!this.isPrismaUniqueViolation(error)) {
        throw error;
      }

      const existing = await this.prisma.client.paymentWebhookEvent.findUnique({
        where: { providerEventId },
      });

      if (!existing) {
        throw new InternalServerErrorException(
          "Payment webhook ledger is missing after collision",
        );
      }

      return { received: true, replayed: true };
    }
  }

  async handleClerkEvent(
    event: ClerkWebhookEventDto,
    svixId: string,
  ): Promise<{ received: true; replayed: boolean }> {
    const shouldProcessUser =
      event.type === "user.created" || event.type === "user.updated";

    const createResult = await this.createClerkLedgerRow(event, svixId);
    if (createResult === "replayed") {
      return { received: true, replayed: true };
    }

    try {
      if (shouldProcessUser) {
        await this.usersService.upsertFromClerk(event.data);
        await this.markClerkLedgerRow(svixId, "processed");
      } else {
        await this.markClerkLedgerRow(svixId, "ignored");
      }

      return { received: true, replayed: false };
    } catch (error: unknown) {
      await this.markClerkLedgerRow(
        svixId,
        "failed",
        this.getErrorMessage(error),
      );
      throw error;
    }
  }

  private async createClerkLedgerRow(
    event: ClerkWebhookEventDto,
    svixId: string,
  ): Promise<"created" | "retry" | "replayed"> {
    try {
      await this.prisma.client.clerkWebhookEvent.create({
        data: {
          providerEventId: svixId,
          eventType: event.type,
          payload: event as Prisma.InputJsonValue,
          status: "received",
          receivedAt: new Date(),
          processedAt: null,
        },
      });
      return "created";
    } catch (error: unknown) {
      if (!this.isPrismaUniqueViolation(error)) {
        throw error;
      }

      const existing = await this.prisma.client.clerkWebhookEvent.findUnique({
        where: { providerEventId: svixId },
      });

      if (!existing) {
        throw new InternalServerErrorException(
          "Clerk webhook ledger is missing after collision",
        );
      }

      if (existing.status === "failed") {
        await this.prisma.client.clerkWebhookEvent.update({
          where: { providerEventId: svixId },
          data: {
            status: "received",
            error: null,
            processedAt: null,
          },
        });
        return "retry";
      }

      return "replayed";
    }
  }

  private async markClerkLedgerRow(
    providerEventId: string,
    status: "processed" | "ignored" | "failed",
    error?: string,
  ) {
    await this.prisma.client.clerkWebhookEvent.update({
      where: { providerEventId },
      data: {
        status,
        error: error ?? null,
        processedAt: new Date(),
      },
    });
  }

  private buildRazorpayProviderEventId(
    event: string,
    createdAt: number | undefined,
    rawBody: string,
  ) {
    return createHash("sha256")
      .update(`${event}.${createdAt ?? ""}.${rawBody}`)
      .digest("hex")
      .slice(0, 64);
  }

  private toRawBodyString(rawBody: Buffer | string) {
    return typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
  }

  private getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  private isPrismaUniqueViolation(error: unknown): error is { code: string } {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    );
  }
}
