import { RequestMethod } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Capability } from "../../common/authz/capabilities.js";
import { CapabilityGuard } from "../../common/authz/capability.guard.js";
import { REQUIRED_CAPABILITIES_KEY } from "../../common/authz/require-capability.decorator.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import { AnalyticsController } from "./analytics.controller.js";
import { AnalyticsService } from "./analytics.service.js";

const PATH_METADATA = "path";
const METHOD_METADATA = "method";
const GUARDS_METADATA = "__guards__";

const mockAnalyticsFindMany = vi.fn();
const mockSubmissionCount = vi.fn();
const mockFormImpressionCount = vi.fn();
const mockWidgetAnalyticsCount = vi.fn();
const mockTestimonialImpressionCount = vi.fn();
const mockTestimonialCount = vi.fn();

const prismaMock = {
  client: {
    projectAnalyticsDaily: {
      findMany: mockAnalyticsFindMany,
    },
    collectionFormSubmission: {
      count: mockSubmissionCount,
    },
    formImpression: {
      count: mockFormImpressionCount,
    },
    widgetAnalytics: {
      count: mockWidgetAnalyticsCount,
    },
    testimonialImpression: {
      count: mockTestimonialImpressionCount,
    },
    testimonial: {
      count: mockTestimonialCount,
    },
  },
} as unknown as PrismaService;

describe("AnalyticsController", () => {
  it("declares a project-scoped analytics summary route for agent reads", () => {
    expect(Reflect.getMetadata(PATH_METADATA, AnalyticsController)).toBe(
      "projects/:slug/analytics",
    );
    expect(Reflect.getMetadata(GUARDS_METADATA, AnalyticsController)).toEqual([
      CapabilityGuard,
    ]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        AnalyticsController.prototype.getSummary,
      ),
    ).toEqual([Capability.VIEW_PROJECT]);
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        AnalyticsController.prototype.getSummary,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        AnalyticsController.prototype.getSummary,
      ),
    ).toBe("summary");
  });
});

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnalyticsService(prismaMock);
  });

  it("summarizes existing daily rows and live event tables for a project", async () => {
    mockAnalyticsFindMany.mockResolvedValue([
      {
        day: new Date("2026-05-09T00:00:00.000Z"),
        formViews: 3,
        formSubmissions: 2,
        widgetLoads: 5,
        testimonialImpressions: 7,
        hostedPageViews: 11,
        apiRequests: 13,
      },
    ]);
    mockSubmissionCount.mockResolvedValue(4);
    mockFormImpressionCount.mockResolvedValue(6);
    mockWidgetAnalyticsCount.mockResolvedValue(8);
    mockTestimonialImpressionCount.mockResolvedValue(10);
    mockTestimonialCount.mockResolvedValue(12);

    const result = await service.getSummary("project_1", {
      days: 7,
      now: new Date("2026-05-10T12:00:00.000Z"),
    });

    expect(mockAnalyticsFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          projectId: "project_1",
          day: { gte: new Date("2026-05-04T00:00:00.000Z") },
        },
        orderBy: { day: "asc" },
      }),
    );
    expect(result.totals).toEqual({
      formViews: 6,
      formSubmissions: 4,
      widgetLoads: 8,
      testimonialImpressions: 10,
      hostedPageViews: 11,
      apiRequests: 13,
      publishedTestimonials: 12,
    });
    expect(result.daily[0]).toMatchObject({
      day: "2026-05-09",
      hostedPageViews: 11,
      apiRequests: 13,
    });
  });
});
