import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { MemberRole } from "@workspace/database/prisma";
import { ProjectAccessService } from "./project-access.service.js";
import { Capability } from "./capabilities.js";
import { REQUIRED_CAPABILITIES_KEY } from "./require-capability.decorator.js";

type RequestWithAuth = {
  params?: { slug?: string };
  user?: { id?: string };
  projectAccess?: {
    projectId: string;
    role: MemberRole;
    capabilities: ReadonlySet<Capability>;
  };
};

@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(ProjectAccessService)
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredCapabilities =
      this.reflector.getAllAndOverride<Capability[]>(
        REQUIRED_CAPABILITIES_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    if (requiredCapabilities.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const slug = request.params?.slug;
    if (!slug) {
      throw new InternalServerErrorException(
        "CapabilityGuard requires :slug param on the route",
      );
    }

    const userId = request.user?.id;
    if (!userId) {
      throw new InternalServerErrorException(
        "CapabilityGuard requires request.user.id",
      );
    }

    const resolved = await this.projectAccessService.resolveBySlug(
      userId,
      slug,
    );

    for (const capability of requiredCapabilities) {
      if (!resolved.capabilities.has(capability)) {
        throw new ForbiddenException(`Missing capability: ${capability}`);
      }
    }

    request.projectAccess = {
      projectId: resolved.project.id,
      role: resolved.role,
      capabilities: resolved.capabilities,
    };

    return true;
  }
}
