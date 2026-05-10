import { describe, expect, it, vi, beforeEach } from "vitest";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";
import type { PrismaService } from "../prisma/prisma.service.js";

const PATH_METADATA = "path";

const mockNotificationCount = vi.fn();
const mockNotificationFindMany = vi.fn();
const mockNotificationFindFirst = vi.fn();
const mockNotificationUpdate = vi.fn();
const mockNotificationUpdateMany = vi.fn();
const mockPreferencesFindUnique = vi.fn();
const mockPreferencesUpsert = vi.fn();

const prismaMock = {
  client: {
    notification: {
      count: mockNotificationCount,
      findMany: mockNotificationFindMany,
      findFirst: mockNotificationFindFirst,
      update: mockNotificationUpdate,
      updateMany: mockNotificationUpdateMany,
    },
    notificationPreferences: {
      findUnique: mockPreferencesFindUnique,
      upsert: mockPreferencesUpsert,
    },
  },
} as unknown as PrismaService;

describe("NotificationsController", () => {
  it("declares the authenticated notifications route family", () => {
    expect(Reflect.getMetadata(PATH_METADATA, NotificationsController)).toBe(
      "notifications",
    );
  });
});

describe("NotificationsService", () => {
  let service: NotificationsService;

  beforeEach(() => {
    service = new NotificationsService(prismaMock);
    vi.clearAllMocks();
  });

  it("lists only the current user's notifications with filters", async () => {
    mockNotificationCount.mockResolvedValue(1);
    mockNotificationFindMany.mockResolvedValue([
      notificationRecord({
        type: "EXPORT_DELIVERY_FAILED",
        metadata: { deliveryId: "del_1" },
      }),
    ]);

    await expect(
      service.list("user_1", {
        page: 2,
        pageSize: 5,
        isRead: false,
        type: "EXPORT_DELIVERY_FAILED",
      }),
    ).resolves.toMatchObject({
      total: 1,
      page: 2,
      pageSize: 5,
      items: [
        {
          id: "notif_1",
          userId: "user_1",
          type: "EXPORT_DELIVERY_FAILED",
          metadata: { deliveryId: "del_1" },
          createdAt: "2026-05-10T00:00:00.000Z",
        },
      ],
    });

    expect(mockNotificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user_1",
          isRead: false,
          type: "EXPORT_DELIVERY_FAILED",
        },
        skip: 5,
        take: 5,
      }),
    );
  });

  it("marks a notification read only when it belongs to the current user", async () => {
    mockNotificationFindFirst.mockResolvedValue({ id: "notif_1" });
    mockNotificationUpdate.mockResolvedValue(
      notificationRecord({ isRead: true }),
    );

    await expect(service.markRead("user_1", "notif_1")).resolves.toMatchObject({
      id: "notif_1",
      isRead: true,
    });

    expect(mockNotificationFindFirst).toHaveBeenCalledWith({
      where: {
        id: "notif_1",
        userId: "user_1",
      },
      select: { id: true },
    });
  });

  it("returns default preferences without creating a row", async () => {
    mockPreferencesFindUnique.mockResolvedValue(null);

    await expect(service.getPreferences("user_1")).resolves.toEqual({
      userId: "user_1",
      emailEnabled: true,
      typePreferences: {},
      updatedAt: null,
    });
  });

  it("updates notification preferences by merging type preferences", async () => {
    mockPreferencesFindUnique.mockResolvedValue({
      userId: "user_1",
      emailEnabled: true,
      typePreferences: {
        SECURITY_ALERT: { email: true, inApp: true },
      },
      updatedAt: new Date("2026-05-09T00:00:00.000Z"),
    });
    mockPreferencesUpsert.mockResolvedValue({
      userId: "user_1",
      emailEnabled: false,
      typePreferences: {
        SECURITY_ALERT: { email: true, inApp: true },
        AGENT_ACTION_CREATED: { email: false, inApp: true },
      },
      updatedAt: new Date("2026-05-10T00:00:00.000Z"),
    });

    await expect(
      service.updatePreferences("user_1", {
        emailEnabled: false,
        typePreferences: {
          AGENT_ACTION_CREATED: { email: false, inApp: true },
        },
      }),
    ).resolves.toMatchObject({
      emailEnabled: false,
      typePreferences: {
        SECURITY_ALERT: { email: true, inApp: true },
        AGENT_ACTION_CREATED: { email: false, inApp: true },
      },
    });
  });
});

function notificationRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "notif_1",
    userId: "user_1",
    type: "SECURITY_ALERT",
    title: "Security alert",
    message: "A credential changed.",
    link: null,
    metadata: null,
    isRead: false,
    createdAt: new Date("2026-05-10T00:00:00.000Z"),
    ...overrides,
  };
}
