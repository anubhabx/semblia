import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Capability } from "../../common/authz/capabilities.js";
import { CapabilityGuard } from "../../common/authz/capability.guard.js";
import { RequireCapability } from "../../common/authz/require-capability.decorator.js";
import { ZodValidationPipe } from "../../common/zod/zod-validation.pipe.js";
import {
  analyticsSummaryQuerySchema,
  type AnalyticsSummaryQueryDto,
} from "./analytics.dto.js";
import { AnalyticsService } from "./analytics.service.js";

type ProjectRequest = { projectAccess?: { projectId: string } };

@Controller("projects/:slug/analytics")
@UseGuards(CapabilityGuard)
export class AnalyticsController {
  constructor(
    @Inject(AnalyticsService)
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get("summary")
  @RequireCapability(Capability.VIEW_PROJECT)
  getSummary(
    @Query(new ZodValidationPipe(analyticsSummaryQuerySchema))
    query: AnalyticsSummaryQueryDto,
    @Req() request: ProjectRequest,
  ) {
    return this.analyticsService.getSummary(this.getProjectId(request), query);
  }

  private getProjectId(request: ProjectRequest) {
    const projectId = request.projectAccess?.projectId;
    if (!projectId) {
      throw new InternalServerErrorException(
        "AnalyticsController requires request.projectAccess.projectId",
      );
    }

    return projectId;
  }
}
