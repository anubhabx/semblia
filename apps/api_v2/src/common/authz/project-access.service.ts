import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MemberRole } from "@workspace/database/prisma";
import { PrismaService } from "../../modules/prisma/prisma.service.js";
import { Capability, ROLE_CAPABILITIES } from "./capabilities.js";

export type ResolvedProjectAccess = {
  project: { id: string; slug: string; userId: string };
  role: MemberRole;
  capabilities: ReadonlySet<Capability>;
};

@Injectable()
export class ProjectAccessService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async resolveBySlug(
    userId: string,
    slug: string,
  ): Promise<ResolvedProjectAccess> {
    const project = await this.prisma.client.project.findUnique({
      where: { slug },
      select: { id: true, slug: true, userId: true },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const membership = await this.prisma.client.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId,
        },
      },
      select: { role: true },
    });

    const role =
      membership?.role ??
      (project.userId === userId ? MemberRole.OWNER : undefined);

    if (!role) {
      throw new ForbiddenException("You do not have access to this project");
    }

    return {
      project,
      role,
      capabilities: ROLE_CAPABILITIES[role],
    };
  }
}
