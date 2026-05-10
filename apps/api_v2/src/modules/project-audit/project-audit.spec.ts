import { describe, expect, it, vi } from "vitest";
import { RequestMethod } from "@nestjs/common";
import { Capability } from "../../common/authz/capabilities.js";
import { CapabilityGuard } from "../../common/authz/capability.guard.js";
import { REQUIRED_CAPABILITIES_KEY } from "../../common/authz/require-capability.decorator.js";
import { ProjectActionAuditService } from "../../common/audit/project-action-audit.service.js";
import { ProjectAuditController } from "./project-audit.controller.js";
import type { PrismaService } from "../prisma/prisma.service.js";

const PATH_METADATA = "path";
const METHOD_METADATA = "method";
const GUARDS_METADATA = "__guards__";
const mockAuditCount = vi.fn();
const mockAuditFindMany = vi.fn();

const prismaMock = {
  client: {
    projectActionAudit: {
      count: mockAuditCount,
      findMany: mockAuditFindMany,
    },
  },
} as unknown as PrismaService;

describe("ProjectAuditController", () => {
  it("declares a project-scoped action audit read route", () => {
    expect(Reflect.getMetadata(PATH_METADATA, ProjectAuditController)).toBe(
      "projects/:slug/action-audit",
    );
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectAuditController.prototype.list,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(GUARDS_METADATA, ProjectAuditController),
    ).toEqual([CapabilityGuard]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectAuditController.prototype.list,
      ),
    ).toEqual([Capability.VIEW_PROJECT]);
  });
});

describe("ProjectActionAuditService list", () => {
  it("returns a project-scoped, paginated audit stream", async () => {
    const service = new ProjectActionAuditService(prismaMock);
    mockAuditCount.mockResolvedValue(1);
    mockAuditFindMany.mockResolvedValue([
      {
        id: "audit_1",
        projectId: "project_1",
        actorType: "agent_key",
        actorId: "user_1",
        credentialId: "key_1",
        action: "submission.annotated",
        targetType: "submission",
        targetId: "sub_1",
        metadata: { label: "launch" },
        createdAt: new Date("2026-05-10T00:00:00.000Z"),
      },
    ]);

    await expect(
      service.list("project_1", {
        page: 1,
        pageSize: 10,
        actorType: "agent_key",
        action: "submission.annotated",
      }),
    ).resolves.toMatchObject({
      total: 1,
      items: [
        {
          id: "audit_1",
          actorType: "agent_key",
          metadata: { label: "launch" },
          createdAt: "2026-05-10T00:00:00.000Z",
        },
      ],
    });

    expect(mockAuditFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          projectId: "project_1",
          actorType: "agent_key",
          action: "submission.annotated",
        },
      }),
    );
  });
});
