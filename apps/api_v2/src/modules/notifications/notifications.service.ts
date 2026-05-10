import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type NotificationType } from "@workspace/database/prisma";
import { paginate } from "../../common/utils/paginate.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  NotificationListQueryDto,
  UpdateNotificationPreferencesBodyDto,
} from "./notifications.dto.js";

const NOTIFICATION_SELECT = {
  id: true,
  userId: true,
  type: true,
  title: true,
  message: true,
  link: true,
  metadata: true,
  isRead: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

const NOTIFICATION_PREFERENCES_SELECT = {
  userId: true,
  emailEnabled: true,
  typePreferences: true,
  updatedAt: true,
} satisfies Prisma.NotificationPreferencesSelect;

type NotificationRecord = Prisma.NotificationGetPayload<{
  select: typeof NOTIFICATION_SELECT;
}>;

type NotificationPreferencesRecord = Prisma.NotificationPreferencesGetPayload<{
  select: typeof NOTIFICATION_PREFERENCES_SELECT;
}>;

@Injectable()
export class NotificationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string, query: NotificationListQueryDto) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
      ...(query.type ? { type: query.type as NotificationType } : {}),
    };
    const skip = (query.page - 1) * query.pageSize;

    const [total, notifications] = await Promise.all([
      this.prisma.client.notification.count({ where }),
      this.prisma.client.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
        select: NOTIFICATION_SELECT,
      }),
    ]);

    return paginate({
      data: notifications.map((notification) =>
        this.toNotificationDto(notification),
      ),
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  unreadCount(userId: string) {
    return this.prisma.client.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markRead(userId: string, notificationId: string) {
    const existing = await this.prisma.client.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Notification not found");
    }

    const notification = await this.prisma.client.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
      select: NOTIFICATION_SELECT,
    });

    return this.toNotificationDto(notification);
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.client.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { updatedCount: result.count };
  }

  async getPreferences(userId: string) {
    const preferences =
      await this.prisma.client.notificationPreferences.findUnique({
        where: { userId },
        select: NOTIFICATION_PREFERENCES_SELECT,
      });

    return this.toPreferencesDto(preferences ?? null, userId);
  }

  async updatePreferences(
    userId: string,
    body: UpdateNotificationPreferencesBodyDto,
  ) {
    const existing = await this.getPreferences(userId);
    const nextTypePreferences = {
      ...existing.typePreferences,
      ...(body.typePreferences ?? {}),
    };

    const preferences = await this.prisma.client.notificationPreferences.upsert(
      {
        where: { userId },
        update: {
          ...(body.emailEnabled !== undefined
            ? { emailEnabled: body.emailEnabled }
            : {}),
          typePreferences: nextTypePreferences,
        },
        create: {
          userId,
          emailEnabled: body.emailEnabled ?? true,
          typePreferences: nextTypePreferences,
        },
        select: NOTIFICATION_PREFERENCES_SELECT,
      },
    );

    return this.toPreferencesDto(preferences, userId);
  }

  private toNotificationDto(notification: NotificationRecord) {
    return {
      ...notification,
      metadata: notification.metadata as Record<string, unknown> | null,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  private toPreferencesDto(
    preferences: NotificationPreferencesRecord | null,
    userId: string,
  ) {
    return {
      userId,
      emailEnabled: preferences?.emailEnabled ?? true,
      typePreferences: (preferences?.typePreferences ?? {}) as Record<
        string,
        { email: boolean; inApp: boolean }
      >,
      updatedAt: preferences?.updatedAt.toISOString() ?? null,
    };
  }
}
