import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebhooksService } from "./webhooks.service.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import type { UsersService } from "../users/users.service.js";
import type {
  ClerkWebhookEventDto,
  ClerkUserPayloadDto,
} from "../users/users.dto.js";

const mockPaymentWebhookCreate = vi.fn();
const mockPaymentWebhookFindUnique = vi.fn();
const mockClerkWebhookCreate = vi.fn();
const mockClerkWebhookFindUnique = vi.fn();
const mockClerkWebhookUpdate = vi.fn();
const mockUserUpsertFromClerk = vi.fn();

const prismaMock = {
  client: {
    paymentWebhookEvent: {
      create: mockPaymentWebhookCreate,
      findUnique: mockPaymentWebhookFindUnique,
    },
    clerkWebhookEvent: {
      create: mockClerkWebhookCreate,
      findUnique: mockClerkWebhookFindUnique,
      update: mockClerkWebhookUpdate,
    },
  },
} as unknown as PrismaService;

const usersServiceMock = {
  upsertFromClerk: mockUserUpsertFromClerk,
} as unknown as UsersService;

const clerkUserPayload: ClerkUserPayloadDto = {
  id: "user_123",
  emailAddresses: [{ emailAddress: "test@example.com" }],
  firstName: "Test",
  lastName: "User",
  imageUrl: "https://example.com/avatar.png",
};

const clerkUserCreatedEvent: ClerkWebhookEventDto = {
  type: "user.created",
  data: clerkUserPayload,
};

describe("WebhooksService", () => {
  let service: WebhooksService;

  beforeEach(() => {
    service = new WebhooksService(prismaMock, usersServiceMock);
    vi.clearAllMocks();
  });

  it("records the first Razorpay delivery in the payment webhook ledger", async () => {
    mockPaymentWebhookCreate.mockResolvedValue({ id: "pwe_123" });

    await expect(
      service.handleRazorpayWebhook({
        body: {
          event: "payment.captured",
          created_at: 1710000000,
          payload: { payment: { entity: { id: "pay_123" } } },
        },
        rawBody: '{"event":"payment.captured","created_at":1710000000}',
      }),
    ).resolves.toEqual({ received: true, replayed: false });

    expect(mockPaymentWebhookCreate).toHaveBeenCalledTimes(1);
    expect(mockPaymentWebhookCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: "razorpay",
        eventType: "payment.captured",
        status: "received",
        processedAt: null,
        payload: {
          event: "payment.captured",
          created_at: 1710000000,
          payload: { payment: { entity: { id: "pay_123" } } },
        },
      }),
    });
    expect(
      mockPaymentWebhookCreate.mock.calls[0]?.[0]?.data.providerEventId,
    ).toHaveLength(64);
  });

  it("returns replayed for a duplicate Razorpay delivery", async () => {
    mockPaymentWebhookCreate.mockRejectedValue({ code: "P2002" });
    mockPaymentWebhookFindUnique.mockResolvedValue({
      id: "pwe_existing",
      providerEventId: "existing_provider_event_id",
    });

    await expect(
      service.handleRazorpayWebhook({
        body: {
          event: "payment.captured",
          created_at: 1710000000,
          payload: { payment: { entity: { id: "pay_123" } } },
        },
        rawBody: '{"event":"payment.captured","created_at":1710000000}',
      }),
    ).resolves.toEqual({ received: true, replayed: true });

    expect(mockPaymentWebhookCreate).toHaveBeenCalledTimes(1);
    expect(mockPaymentWebhookFindUnique).toHaveBeenCalledTimes(1);
  });

  it("derives a deterministic Razorpay providerEventId from event, created_at, and raw body", async () => {
    mockPaymentWebhookCreate.mockResolvedValue({ id: "pwe_123" });

    await service.handleRazorpayWebhook({
      body: {
        event: "payment.captured",
        created_at: 1710000000,
        payload: { payment: { entity: { id: "pay_123" } } },
      },
      rawBody:
        '{"event":"payment.captured","created_at":1710000000,"payload":{"payment":{"entity":{"id":"pay_123"}}}}',
    });
    const firstProviderEventId =
      mockPaymentWebhookCreate.mock.calls[0]?.[0]?.data.providerEventId;

    vi.clearAllMocks();
    mockPaymentWebhookCreate.mockResolvedValue({ id: "pwe_456" });

    await service.handleRazorpayWebhook({
      body: {
        event: "payment.captured",
        created_at: 1710000000,
        payload: { payment: { entity: { id: "pay_123" } } },
      },
      rawBody:
        '{"event":"payment.captured","created_at":1710000000,"payload":{"payment":{"entity":{"id":"pay_123"}}}}',
    });
    const secondProviderEventId =
      mockPaymentWebhookCreate.mock.calls[0]?.[0]?.data.providerEventId;

    vi.clearAllMocks();
    mockPaymentWebhookCreate.mockResolvedValue({ id: "pwe_789" });

    await service.handleRazorpayWebhook({
      body: {
        event: "payment.captured",
        created_at: 1710000000,
        payload: { payment: { entity: { id: "pay_123" } } },
      },
      rawBody:
        '{"event":"payment.captured","created_at":1710000000,"payload":{"payment":{"entity":{"id":"pay_456"}}}}',
    });
    const thirdProviderEventId =
      mockPaymentWebhookCreate.mock.calls[0]?.[0]?.data.providerEventId;

    expect(firstProviderEventId).toBe(secondProviderEventId);
    expect(firstProviderEventId).not.toBe(thirdProviderEventId);
  });

  it("records the first Clerk user.created delivery, upserts the user, and marks the ledger row processed", async () => {
    mockClerkWebhookCreate.mockResolvedValue({ id: "cwe_123" });
    mockUserUpsertFromClerk.mockResolvedValue(undefined);
    mockClerkWebhookUpdate.mockResolvedValue({ id: "cwe_123" });

    await expect(
      service.handleClerkEvent(clerkUserCreatedEvent, "msg_123"),
    ).resolves.toEqual({ received: true, replayed: false });

    expect(mockClerkWebhookCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        providerEventId: "msg_123",
        eventType: "user.created",
        status: "received",
        processedAt: null,
        payload: clerkUserCreatedEvent,
      }),
    });
    expect(mockUserUpsertFromClerk).toHaveBeenCalledWith(clerkUserPayload);
    expect(mockClerkWebhookUpdate).toHaveBeenCalledWith({
      where: { providerEventId: "msg_123" },
      data: expect.objectContaining({
        status: "processed",
        error: null,
      }),
    });
  });

  it("short-circuits a replayed Clerk event when the existing row is already processed", async () => {
    mockClerkWebhookCreate.mockRejectedValue({ code: "P2002" });
    mockClerkWebhookFindUnique.mockResolvedValue({
      providerEventId: "msg_123",
      status: "processed",
    });

    await expect(
      service.handleClerkEvent(clerkUserCreatedEvent, "msg_123"),
    ).resolves.toEqual({ received: true, replayed: true });

    expect(mockUserUpsertFromClerk).not.toHaveBeenCalled();
    expect(mockClerkWebhookUpdate).not.toHaveBeenCalled();
  });

  it("retries a Clerk delivery after a previously failed ledger row", async () => {
    mockClerkWebhookCreate.mockRejectedValue({ code: "P2002" });
    mockClerkWebhookFindUnique.mockResolvedValue({
      providerEventId: "msg_123",
      status: "failed",
    });
    mockUserUpsertFromClerk.mockResolvedValue(undefined);
    mockClerkWebhookUpdate.mockResolvedValue({ providerEventId: "msg_123" });

    await expect(
      service.handleClerkEvent(clerkUserCreatedEvent, "msg_123"),
    ).resolves.toEqual({ received: true, replayed: false });

    expect(mockUserUpsertFromClerk).toHaveBeenCalledWith(clerkUserPayload);
    expect(mockClerkWebhookUpdate).toHaveBeenCalledWith({
      where: { providerEventId: "msg_123" },
      data: expect.objectContaining({
        status: "processed",
        error: null,
      }),
    });
  });

  it("marks non-user Clerk events as ignored", async () => {
    mockClerkWebhookCreate.mockResolvedValue({ id: "cwe_456" });
    mockClerkWebhookUpdate.mockResolvedValue({ id: "cwe_456" });

    await expect(
      service.handleClerkEvent(
        {
          type: "session.created",
          data: clerkUserPayload,
        },
        "msg_456",
      ),
    ).resolves.toEqual({ received: true, replayed: false });

    expect(mockUserUpsertFromClerk).not.toHaveBeenCalled();
    expect(mockClerkWebhookUpdate).toHaveBeenCalledWith({
      where: { providerEventId: "msg_456" },
      data: expect.objectContaining({
        status: "ignored",
        error: null,
      }),
    });
  });

  it("marks the Clerk ledger row failed and rethrows when upsertFromClerk fails", async () => {
    const error = new Error("temporary outage");

    mockClerkWebhookCreate.mockResolvedValue({ id: "cwe_789" });
    mockUserUpsertFromClerk.mockRejectedValue(error);
    mockClerkWebhookUpdate.mockResolvedValue({ id: "cwe_789" });

    await expect(
      service.handleClerkEvent(clerkUserCreatedEvent, "msg_789"),
    ).rejects.toThrow("temporary outage");

    expect(mockClerkWebhookUpdate).toHaveBeenCalledWith({
      where: { providerEventId: "msg_789" },
      data: expect.objectContaining({
        status: "failed",
        error: "temporary outage",
      }),
    });
  });
});
