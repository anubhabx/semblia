import { describe, expect, it, vi } from "vitest";
import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { MemberRole } from "@workspace/database/prisma";
import { Capability } from "./capabilities.js";
import { CapabilityGuard } from "./capability.guard.js";
import type { ProjectAccessService } from "./project-access.service.js";

function createExecutionContext(
  request: Record<string, unknown>,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => "handler",
    getClass: () => "controller",
  } as unknown as ExecutionContext;
}

describe("CapabilityGuard", () => {
  it("is a no-op when no capabilities are required", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const projectAccessService = {
      resolveBySlug: vi.fn(),
    } as unknown as ProjectAccessService;
    const guard = new CapabilityGuard(reflector, projectAccessService);

    await expect(
      guard.canActivate(
        createExecutionContext({ params: {}, user: { id: "user_1" } }),
      ),
    ).resolves.toBe(true);
    expect(projectAccessService.resolveBySlug).not.toHaveBeenCalled();
  });

  it("allows editors to use review-only routes", async () => {
    const reflector = {
      getAllAndOverride: vi
        .fn()
        .mockReturnValue([Capability.REVIEW_TESTIMONIALS]),
    } as unknown as Reflector;
    const projectAccessService = {
      resolveBySlug: vi.fn().mockResolvedValue({
        project: { id: "project_1", slug: "alpha", userId: "owner_1" },
        role: MemberRole.EDITOR,
        capabilities: new Set([
          Capability.VIEW_PROJECT,
          Capability.REVIEW_TESTIMONIALS,
        ]),
      }),
    } as unknown as ProjectAccessService;
    const guard = new CapabilityGuard(reflector, projectAccessService);
    const request = { params: { slug: "alpha" }, user: { id: "editor_1" } };

    await expect(
      guard.canActivate(createExecutionContext(request)),
    ).resolves.toBe(true);
    expect(request).toMatchObject({
      projectAccess: {
        projectId: "project_1",
        role: MemberRole.EDITOR,
      },
    });
  });

  it("rejects editors from publish routes", async () => {
    const reflector = {
      getAllAndOverride: vi
        .fn()
        .mockReturnValue([Capability.PUBLISH_TESTIMONIALS]),
    } as unknown as Reflector;
    const projectAccessService = {
      resolveBySlug: vi.fn().mockResolvedValue({
        project: { id: "project_1", slug: "alpha", userId: "owner_1" },
        role: MemberRole.EDITOR,
        capabilities: new Set([
          Capability.VIEW_PROJECT,
          Capability.REVIEW_TESTIMONIALS,
        ]),
      }),
    } as unknown as ProjectAccessService;
    const guard = new CapabilityGuard(reflector, projectAccessService);

    await expect(
      guard.canActivate(
        createExecutionContext({
          params: { slug: "alpha" },
          user: { id: "editor_1" },
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("allows viewers to use project read routes", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue([Capability.VIEW_PROJECT]),
    } as unknown as Reflector;
    const projectAccessService = {
      resolveBySlug: vi.fn().mockResolvedValue({
        project: { id: "project_1", slug: "alpha", userId: "owner_1" },
        role: MemberRole.VIEWER,
        capabilities: new Set([Capability.VIEW_PROJECT]),
      }),
    } as unknown as ProjectAccessService;
    const guard = new CapabilityGuard(reflector, projectAccessService);

    await expect(
      guard.canActivate(
        createExecutionContext({
          params: { slug: "alpha" },
          user: { id: "viewer_1" },
        }),
      ),
    ).resolves.toBe(true);
  });

  it("rejects viewers from publish routes", async () => {
    const reflector = {
      getAllAndOverride: vi
        .fn()
        .mockReturnValue([Capability.PUBLISH_TESTIMONIALS]),
    } as unknown as Reflector;
    const projectAccessService = {
      resolveBySlug: vi.fn().mockResolvedValue({
        project: { id: "project_1", slug: "alpha", userId: "owner_1" },
        role: MemberRole.VIEWER,
        capabilities: new Set([Capability.VIEW_PROJECT]),
      }),
    } as unknown as ProjectAccessService;
    const guard = new CapabilityGuard(reflector, projectAccessService);

    await expect(
      guard.canActivate(
        createExecutionContext({
          params: { slug: "alpha" },
          user: { id: "viewer_1" },
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("throws when slug is missing", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue([Capability.VIEW_PROJECT]),
    } as unknown as Reflector;
    const projectAccessService = {
      resolveBySlug: vi.fn(),
    } as unknown as ProjectAccessService;
    const guard = new CapabilityGuard(reflector, projectAccessService);

    await expect(
      guard.canActivate(
        createExecutionContext({ params: {}, user: { id: "user_1" } }),
      ),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
