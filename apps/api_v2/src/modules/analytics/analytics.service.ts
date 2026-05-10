import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

export type AnalyticsSummaryOptions = {
  days: number;
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
}

function startOfUtcDay(now: Date, days: number) {
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);
  return since;
}
