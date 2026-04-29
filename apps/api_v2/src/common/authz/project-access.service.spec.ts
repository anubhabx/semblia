import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { MemberRole } from "@workspace/database/prisma";
import { Capability } from "./capabilities.js";
import { ProjectAccessService } from "./project-access.service.js";
import type { PrismaService } from "../../modules/prisma/prisma.service.js";

const mockProjectFindUnique = vi.fn();
const mockProjectMemberFindUnique = vi.fn();

const prismaMock = {
  client: {
    project: { findUnique: mockProjectFindUnique },
    projectMember: { findUnique: mockProjectMemberFindUnique },
  },
} as unknown as PrismaService;

describe("ProjectAccessService", () => {
  let service: ProjectAccessService;

  beforeEach(() => {
    service = new ProjectAccessService(prismaMock);
    vi.clearAllMocks();
  });

  it("treats the project owner as OWNER even without a membership row", async () => {
    mockProjectFindUnique.mockResolvedValue({
      id: "project_1",
      slug: "alpha",
      userId: "user_1",
    });
    mockProjectMemberFindUnique.mockResolvedValue(null);

    const result = await service.resolveBySlug("user_1", "alpha");

    expect(result.role).toBe(MemberRole.OWNER);
    expect(result.capabilities.has(Capability.MANAGE_PROJECT)).toBe(true);
  });

  it("returns member role capabilities for non-owner members", async () => {
    mockProjectFindUnique.mockResolvedValue({
      id: "project_1",
      slug: "alpha",
      userId: "owner_1",
    });
    mockProjectMemberFindUnique.mockResolvedValue({ role: MemberRole.EDITOR });

    const result = await service.resolveBySlug("editor_1", "alpha");

    expect(result.role).toBe(MemberRole.EDITOR);
    expect(result.capabilities.has(Capability.REVIEW_TESTIMONIALS)).toBe(true);
  });

  it("throws when the project is missing", async () => {
    mockProjectFindUnique.mockResolvedValue(null);

    await expect(service.resolveBySlug("user_1", "missing")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("throws when neither owner nor member has access", async () => {
    mockProjectFindUnique.mockResolvedValue({
      id: "project_1",
      slug: "alpha",
      userId: "owner_1",
    });
    mockProjectMemberFindUnique.mockResolvedValue(null);

    await expect(service.resolveBySlug("user_2", "alpha")).rejects.toThrow(
      ForbiddenException,
    );
  });
});
