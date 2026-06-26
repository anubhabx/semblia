import { Controller, Inject, Param, Post } from "@nestjs/common";
import type { ActorContext } from "../../common/authz/actor-context.js";
import { CurrentActor } from "../../common/decorators/current-actor.decorator.js";
import { CurrentUserId } from "../../common/decorators/current-user-id.decorator.js";
import { ZodValidationPipe } from "../../common/zod/zod-validation.pipe.js";
import {
  projectInviteParamsSchema,
  type ProjectInviteParamsDto,
} from "./projects.dto.js";
import { ProjectsService } from "./projects.service.js";

@Controller("me/project-invites")
export class ProjectInvitesController {
  constructor(
    @Inject(ProjectsService)
    private readonly projectsService: ProjectsService,
  ) {}

  @Post(":inviteId/accept")
  accept(
    @CurrentUserId() userId: string,
    @CurrentActor() actor: ActorContext | null,
    @Param(new ZodValidationPipe(projectInviteParamsSchema))
    params: ProjectInviteParamsDto,
  ) {
    return this.projectsService.acceptMemberInvite(userId, params, actor);
  }
}
