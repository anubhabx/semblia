import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@workspace/database/prisma";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  FormViewEventBodyDto,
  HostedPageViewEventBodyDto,
  TestimonialImpressionEventBodyDto,
  WidgetLoadEventBodyDto,
} from "./analytics.dto.js";

export type AnalyticsSummaryOptions = {
  days: number;
  now?: Date;
};

export type AnalyticsEventContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
  now?: Date;
};

@Injectable()
export class AnalyticsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSummary(projectId: string, options: AnalyticsSummaryOptions) {
    const now = options.now ?? new Date();
    const since = startOfUtcDay(now, options.days);

    const [
      dailyRows,
      formSubmissions,
      formViews,
      widgetLoads,
      testimonialImpressions,
      publishedTestimonials,
    ] = await Promise.all([
      this.prisma.client.projectAnalyticsDaily.findMany({
        where: {
          projectId,
          day: { gte: since },
        },
        orderBy: { day: "asc" },
        select: {
          day: true,
          formViews: true,
          formSubmissions: true,
          widgetLoads: true,
          testimonialImpressions: true,
          hostedPageViews: true,
          apiRequests: true,
        },
      }),
      this.prisma.client.collectionFormSubmission.count({
        where: { projectId, createdAt: { gte: since } },
      }),
      this.prisma.client.formImpression.count({
        where: { projectId, timestamp: { gte: since } },
      }),
      this.prisma.client.widgetAnalytics.count({
        where: { projectId, timestamp: { gte: since } },
      }),
      this.prisma.client.testimonialImpression.count({
        where: { projectId, timestamp: { gte: since } },
      }),
      this.prisma.client.testimonial.count({
        where: { projectId, isPublished: true },
      }),
    ]);

    const daily = dailyRows.map((row) => ({
      day: row.day.toISOString().slice(0, 10),
      formViews: row.formViews,
      formSubmissions: row.formSubmissions,
      widgetLoads: row.widgetLoads,
      testimonialImpressions: row.testimonialImpressions,
      hostedPageViews: row.hostedPageViews,
      apiRequests: row.apiRequests,
    }));
    const dailyTotals = daily.reduce(
      (totals, row) => ({
        hostedPageViews: totals.hostedPageViews + row.hostedPageViews,
        apiRequests: totals.apiRequests + row.apiRequests,
      }),
      { hostedPageViews: 0, apiRequests: 0 },
    );

    return {
      range: {
        days: options.days,
        since: since.toISOString(),
        until: now.toISOString(),
      },
      totals: {
        formViews,
        formSubmissions,
        widgetLoads,
        testimonialImpressions,
        hostedPageViews: dailyTotals.hostedPageViews,
        apiRequests: dailyTotals.apiRequests,
        publishedTestimonials,
      },
      daily,
    };
  }

  async recordFormView(
    body: FormViewEventBodyDto,
    context: AnalyticsEventContext = {},
  ) {
    const project = await this.prisma.client.project.findUnique({
      where: { slug: body.projectSlug },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    let formId: string | null = null;
    if (body.formId) {
      const form = await this.prisma.client.collectionForm.findFirst({
        where: {
          id: body.formId,
          projectId: project.id,
          isActive: true,
        },
        select: { id: true },
      });
      if (!form) {
        throw new NotFoundException("Form not found");
      }
      formId = form.id;
    }

    await this.prisma.client.$transaction([
      this.prisma.client.formImpression.create({
        data: {
          projectId: project.id,
          formId,
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
          timestamp: context.now ?? new Date(),
        },
      }),
      this.incrementDailyMetric(project.id, "formViews", 1, context.now),
    ]);

    return this.eventAccepted("form_view");
  }

  async recordWidgetLoad(
    body: WidgetLoadEventBodyDto,
    context: AnalyticsEventContext = {},
  ) {
    const widget = await this.prisma.client.widget.findFirst({
      where: {
        id: body.widgetId,
        isActive: true,
      },
      select: {
        id: true,
        projectId: true,
        layout: true,
      },
    });
    if (!widget) {
      throw new NotFoundException("Widget not found");
    }

    await this.prisma.client.$transaction([
      this.prisma.client.widgetAnalytics.create({
        data: {
          widgetId: widget.id,
          projectId: widget.projectId,
          loadTime: body.loadTimeMs,
          layoutType: widget.layout,
          browser: body.browser ?? null,
          device: body.device ?? null,
          country: body.country ?? null,
          errorCode: body.errorCode ?? null,
          version: body.version,
          timestamp: context.now ?? new Date(),
        },
      }),
      this.incrementDailyMetric(
        widget.projectId,
        "widgetLoads",
        1,
        context.now,
      ),
    ]);

    return this.eventAccepted("widget_load");
  }

  async recordTestimonialImpression(
    body: TestimonialImpressionEventBodyDto,
    context: AnalyticsEventContext = {},
  ) {
    const testimonial = await this.prisma.client.testimonial.findFirst({
      where: {
        id: body.testimonialId,
        isApproved: true,
        isPublished: true,
      },
      select: {
        id: true,
        projectId: true,
      },
    });
    if (!testimonial) {
      throw new NotFoundException("Testimonial not found");
    }
    const projectId = testimonial.projectId;
    if (!projectId) {
      throw new NotFoundException("Testimonial project not found");
    }

    const widget = await this.prisma.client.widget.findFirst({
      where: {
        id: body.widgetId,
        projectId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });
    if (!widget) {
      throw new NotFoundException("Widget not found");
    }

    await this.prisma.client.$transaction([
      this.prisma.client.testimonialImpression.create({
        data: {
          testimonialId: testimonial.id,
          widgetId: widget.id,
          projectId,
          device: body.device ?? null,
          country: body.country ?? null,
          timestamp: context.now ?? new Date(),
        },
      }),
      this.incrementDailyMetric(
        projectId,
        "testimonialImpressions",
        1,
        context.now,
      ),
    ]);

    return this.eventAccepted("testimonial_impression");
  }

  async recordHostedPageView(
    body: HostedPageViewEventBodyDto,
    context: AnalyticsEventContext = {},
  ) {
    const project = body.hostname
      ? await this.findProjectByActivePublicHost(body.hostname)
      : await this.prisma.client.project.findUnique({
          where: { slug: body.projectSlug },
          select: { id: true },
        });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    await this.incrementDailyMetric(
      project.id,
      "hostedPageViews",
      1,
      context.now,
    );

    return this.eventAccepted("hosted_page_view");
  }

  private incrementDailyMetric(
    projectId: string,
    metric: keyof Pick<
      Prisma.ProjectAnalyticsDailyUncheckedCreateInput,
      | "formViews"
      | "formSubmissions"
      | "widgetLoads"
      | "testimonialImpressions"
      | "hostedPageViews"
      | "apiRequests"
    >,
    increment: number,
    now = new Date(),
  ) {
    const day = startOfUtcDay(now, 1);

    return this.prisma.client.projectAnalyticsDaily.upsert({
      where: {
        projectId_day: {
          projectId,
          day,
        },
      },
      create: {
        projectId,
        day,
        [metric]: increment,
      },
      update: {
        [metric]: { increment },
      },
    });
  }

  private async findProjectByActivePublicHost(hostname: string) {
    const normalizedHostname = normalizeHostname(hostname);
    const host = await this.prisma.client.publicSurfaceHost.findFirst({
      where: {
        hostname: normalizedHostname,
        status: "ACTIVE",
      },
      select: {
        project: {
          select: { id: true },
        },
      },
    });

    return host?.project ?? null;
  }

  private eventAccepted(type: string) {
    return {
      accepted: true,
      type,
    };
  }
}

function startOfUtcDay(now: Date, days: number) {
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);
  return since;
}

function normalizeHostname(value: string) {
  const trimmed = value.trim().toLowerCase().replace(/\.$/, "");
  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
      .hostname;
  } catch {
    return trimmed;
  }
}
