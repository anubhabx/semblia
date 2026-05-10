import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { MemberRole } from "@workspace/database/prisma";
import { Capability } from "../../common/authz/capabilities.js";
import { ProjectsService } from "./projects.service.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import type { OrganizationsService } from "../organizations/organizations.service.js";

const mockProjectFindUnique = vi.fn();
const mockProjectFindMany = vi.fn();
const mockProjectCount = vi.fn();
const mockProjectUpdate = vi.fn();
const mockProjectCreate = vi.fn();
const mockProjectMemberCreate = vi.fn();
const mockProjectMemberFindMany = vi.fn();
const mockProjectTrustedOriginFindMany = vi.fn();
const mockPublicSurfaceHostCreateMany = vi.fn();
const mockTestimonialGroupBy = vi.fn();
const mockTestimonialCount = vi.fn();
const mockTransaction = vi.fn();
const mockEnsureOrganizationForActor = vi.fn();

const prismaMock = {
  client: {
    $transaction: mockTransaction,
    project: {
      findUnique: mockProjectFindUnique,
      findMany: mockProjectFindMany,
      count: mockProjectCount,
      update: mockProjectUpdate,
      create: mockProjectCreate,
    },
    testimonial: {
      groupBy: mockTestimonialGroupBy,
      count: mockTestimonialCount,
    },
    projectMember: {
      create: mockProjectMemberCreate,
      findMany: mockProjectMemberFindMany,
    },
    projectTrustedOrigin: {
      findMany: mockProjectTrustedOriginFindMany,
    },
    publicSurfaceHost: {
      createMany: mockPublicSurfaceHostCreateMany,
    },
  },
} as unknown as PrismaService;

const organizationsServiceMock = {
  ensureForActor: mockEnsureOrganizationForActor,
} as unknown as OrganizationsService;

describe("ProjectsService allowed origins", () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService(prismaMock, organizationsServiceMock);
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(prismaMock.client),
    );
    mockProjectMemberFindMany.mockResolvedValue([]);
    mockTestimonialCount.mockResolvedValue(0);
  });

  it("lists active normalized origins merged with legacy project origins", async () => {
    mockProjectFindUnique.mockResolvedValue({
      allowedOrigins: ["https://legacy.example.com"],
    });
    mockProjectTrustedOriginFindMany.mockResolvedValue([
      { origin: "https://normalized.example.com" },
    ]);

    await expect(service.listAllowedOrigins("project_1")).resolves.toEqual([
      "https://legacy.example.com",
      "https://normalized.example.com",
    ]);
  });

  it("throws when listing allowed origins for a missing project", async () => {
    mockProjectFindUnique.mockResolvedValue(null);

    await expect(service.listAllowedOrigins("project_1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("replaces normalized origins and keeps the project shim synchronized", async () => {
    mockProjectUpdate.mockResolvedValue({
      allowedOrigins: ["https://alpha.example.com", "https://beta.example.com"],
    });
    const tx = {
      projectTrustedOrigin: {
        updateMany: vi.fn(),
        upsert: vi.fn(),
      },
      project: {
        update: mockProjectUpdate,
      },
    };
    mockTransaction.mockImplementation(
      async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
    );

    const result = await service.replaceAllowedOrigins("project_1", [
      "https://beta.example.com",
      "https://ALPHA.example.com",
      "https://alpha.example.com",
      "https://alpha.example.com",
    ]);

    expect(tx.projectTrustedOrigin.updateMany).toHaveBeenCalledWith({
      where: {
        projectId: "project_1",
        status: "ACTIVE",
        origin: {
          notIn: ["https://alpha.example.com", "https://beta.example.com"],
        },
      },
      data: { status: "DISABLED" },
    });
    expect(tx.projectTrustedOrigin.upsert).toHaveBeenCalledTimes(2);
    expect(tx.projectTrustedOrigin.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          projectId_origin: {
            projectId: "project_1",
            origin: "https://alpha.example.com",
          },
        },
        update: expect.objectContaining({ status: "ACTIVE" }),
        create: expect.objectContaining({
          projectId: "project_1",
          origin: "https://alpha.example.com",
          kind: "COLLECTION",
          status: "ACTIVE",
        }),
      }),
    );
    expect(mockProjectUpdate).toHaveBeenCalledWith({
      where: { id: "project_1" },
      data: {
        allowedOrigins: [
          "https://alpha.example.com",
          "https://beta.example.com",
        ],
      },
      select: { allowedOrigins: true },
    });
    expect(result).toEqual([
      "https://alpha.example.com",
      "https://beta.example.com",
    ]);
  });

  it("creates default public surface hosts for new projects", async () => {
    mockProjectCreate.mockResolvedValue({
      id: "project_1",
      userId: "user_1",
      organizationId: null,
      name: "Acme",
      shortDescription: null,
      description: null,
      slug: "acme",
      logoUrl: null,
      projectType: null,
      websiteUrl: null,
      collectionFormUrl: null,
      brandColorPrimary: null,
      brandColorSecondary: null,
      socialLinks: null,
      tags: [],
      visibility: "PRIVATE",
      isActive: true,
      autoModeration: true,
      autoApproveVerified: false,
      profanityFilterLevel: "MODERATE",
      formConfig: null,
      createdAt: new Date("2026-05-02T00:00:00.000Z"),
      updatedAt: new Date("2026-05-02T00:00:00.000Z"),
      _count: {
        testimonials: 0,
        widgets: 0,
        apiKeys: 0,
      },
    });

    await service.create("user_1", {
      name: "Acme",
      slug: "acme",
      tags: [],
    });

    expect(mockProjectMemberCreate).toHaveBeenCalledWith({
      data: {
        projectId: "project_1",
        userId: "user_1",
        role: MemberRole.OWNER,
      },
    });
    expect(mockPublicSurfaceHostCreateMany).toHaveBeenCalledWith({
      data: [
        {
          projectId: "project_1",
          feature: "COLLECTION",
          resourceType: "PROJECT",
          hostname: "acme.testimonials.tresta.app",
          isDefault: true,
          status: "ACTIVE",
          verifiedAt: expect.any(Date),
        },
        {
          projectId: "project_1",
          feature: "WALL",
          resourceType: "PROJECT",
          hostname: "acme.walls.tresta.app",
          isDefault: true,
          status: "ACTIVE",
          verifiedAt: expect.any(Date),
        },
      ],
      skipDuplicates: true,
    });
  });

  it("creates new projects under the active Clerk organization when present", async () => {
    mockEnsureOrganizationForActor.mockResolvedValue({
      id: "org_1",
      clerkOrgId: "org_clerk_1",
      name: "Acme",
      slug: "acme",
      createdAt: new Date("2026-05-02T00:00:00.000Z"),
      updatedAt: new Date("2026-05-02T00:00:00.000Z"),
    });
    mockProjectCreate.mockResolvedValue({
      id: "project_1",
      userId: "user_1",
      organizationId: "org_1",
      name: "Acme",
      shortDescription: null,
      description: null,
      slug: "acme",
      logoUrl: null,
      projectType: null,
      websiteUrl: null,
      collectionFormUrl: null,
      brandColorPrimary: null,
      brandColorSecondary: null,
      socialLinks: null,
      tags: [],
      visibility: "PRIVATE",
      isActive: true,
      autoModeration: true,
      autoApproveVerified: false,
      profanityFilterLevel: "MODERATE",
      formConfig: null,
      createdAt: new Date("2026-05-02T00:00:00.000Z"),
      updatedAt: new Date("2026-05-02T00:00:00.000Z"),
      _count: {
        testimonials: 0,
        widgets: 0,
        apiKeys: 0,
      },
    });

    await service.create(
      "user_1",
      {
        name: "Acme",
        slug: "acme",
        tags: [],
      },
      {
        actorType: "user",
        userId: "user_1",
        clerkOrgId: "org_clerk_1",
        clerkOrgSlug: "acme",
        clerkOrgRole: "admin",
        clerkOrgPermissions: [],
        scopes: [],
      },
    );

    expect(mockEnsureOrganizationForActor).toHaveBeenCalledWith(
      expect.objectContaining({ clerkOrgId: "org_clerk_1" }),
    );
    expect(mockProjectCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user_1",
          organizationId: "org_1",
          slug: "acme",
        }),
      }),
    );
  });

  it("restricts credential project lists to the bound project", async () => {
    mockProjectCount.mockResolvedValue(1);
    mockProjectFindMany.mockResolvedValue([
      projectRecord({ id: "project_scoped", slug: "scoped" }),
    ]);
    mockTestimonialGroupBy.mockResolvedValue([]);

    const result = await service.list(
      "user_1",
      { page: 1, pageSize: 10 },
      {
        actorType: "agent_key",
        userId: "user_1",
        projectId: "project_scoped",
        credentialId: "key_1",
        clerkOrgPermissions: [],
        scopes: ["project:read"],
      },
    );

    expect(mockProjectCount).toHaveBeenCalledWith({
      where: { id: "project_scoped" },
    });
    expect(mockProjectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "project_scoped" },
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.access).toEqual({
      role: "AGENT_KEY",
      capabilities: ["VIEW_PROJECT"],
    });
  });

  it("projects legacy membership capabilities in project list responses", async () => {
    mockProjectCount.mockResolvedValue(1);
    mockProjectFindMany.mockResolvedValue([
      projectRecord({ id: "project_1", userId: "other_user" }),
    ]);
    mockTestimonialGroupBy.mockResolvedValue([]);
    mockProjectMemberFindMany.mockResolvedValue([
      { projectId: "project_1", role: MemberRole.EDITOR },
    ]);

    const result = await service.list("user_1", { page: 1, pageSize: 10 });

    expect(mockProjectMemberFindMany).toHaveBeenCalledWith({
      where: {
        projectId: { in: ["project_1"] },
        userId: "user_1",
      },
      select: {
        projectId: true,
        role: true,
      },
    });
    expect(result.items[0]?.access).toEqual({
      role: MemberRole.EDITOR,
      capabilities: [
        "OPERATE_PROJECT",
        "PUBLISH_TESTIMONIALS",
        "REVIEW_TESTIMONIALS",
        "VIEW_PROJECT",
      ],
    });
  });

  it("uses the resolved route access block for project detail responses", async () => {
    mockProjectFindUnique.mockResolvedValue(projectRecord());
    mockProjectMemberFindMany.mockResolvedValue([]);
    mockTestimonialGroupBy.mockResolvedValue([]);

    await expect(
      service.getBySlug(
        "user_1",
        { slug: "acme" },
        {
          role: "ORG_ADMIN",
          capabilities: new Set([
            Capability.VIEW_PROJECT,
            Capability.MANAGE_PROJECT,
          ]),
        },
      ),
    ).resolves.toMatchObject({
      slug: "acme",
      access: {
        role: "ORG_ADMIN",
        capabilities: ["MANAGE_PROJECT", "VIEW_PROJECT"],
      },
    });
  });

  it("blocks project creation from scoped API or agent credentials", async () => {
    await expect(
      service.create(
        "user_1",
        {
          name: "Acme",
          slug: "acme",
          tags: [],
        },
        {
          actorType: "agent_key",
          userId: "user_1",
          projectId: "project_1",
          credentialId: "key_1",
          clerkOrgPermissions: [],
          scopes: ["project:read"],
        },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(mockProjectCreate).not.toHaveBeenCalled();
  });
});

function projectRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "project_1",
    userId: "user_1",
    organizationId: null,
    name: "Acme",
    shortDescription: null,
    description: null,
    slug: "acme",
    logoUrl: null,
    projectType: null,
    websiteUrl: null,
    collectionFormUrl: null,
    brandColorPrimary: null,
    brandColorSecondary: null,
    socialLinks: null,
    tags: [],
    visibility: "PRIVATE",
    isActive: true,
    autoModeration: true,
    autoApproveVerified: false,
    profanityFilterLevel: "MODERATE",
    formConfig: null,
    createdAt: new Date("2026-05-02T00:00:00.000Z"),
    updatedAt: new Date("2026-05-02T00:00:00.000Z"),
    _count: {
      testimonials: 0,
      widgets: 0,
      apiKeys: 0,
    },
    ...overrides,
  };
}
