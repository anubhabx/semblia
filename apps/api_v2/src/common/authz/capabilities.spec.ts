import { describe, expect, it } from "vitest";
import { MemberRole } from "@workspace/database/prisma";
import {
  Capability,
  ROLE_CAPABILITIES,
  roleHasCapability,
} from "./capabilities.js";

describe("ROLE_CAPABILITIES", () => {
  it("matches the locked role capability table", () => {
    expect([...ROLE_CAPABILITIES[MemberRole.OWNER]]).toEqual([
      Capability.VIEW_PROJECT,
      Capability.REVIEW_TESTIMONIALS,
      Capability.PUBLISH_TESTIMONIALS,
      Capability.MANAGE_PUBLISH_SURFACES,
      Capability.MANAGE_PROJECT,
      Capability.MANAGE_MEMBERS,
    ]);

    expect([...ROLE_CAPABILITIES[MemberRole.ADMIN]]).toEqual([
      Capability.VIEW_PROJECT,
      Capability.REVIEW_TESTIMONIALS,
      Capability.PUBLISH_TESTIMONIALS,
      Capability.MANAGE_PUBLISH_SURFACES,
      Capability.MANAGE_PROJECT,
      Capability.MANAGE_MEMBERS,
    ]);

    expect([...ROLE_CAPABILITIES[MemberRole.EDITOR]]).toEqual([
      Capability.VIEW_PROJECT,
      Capability.REVIEW_TESTIMONIALS,
    ]);

    expect([...ROLE_CAPABILITIES[MemberRole.VIEWER]]).toEqual([
      Capability.VIEW_PROJECT,
    ]);
  });

  it("checks role capability membership", () => {
    expect(
      roleHasCapability(MemberRole.EDITOR, Capability.REVIEW_TESTIMONIALS),
    ).toBe(true);
    expect(
      roleHasCapability(MemberRole.VIEWER, Capability.PUBLISH_TESTIMONIALS),
    ).toBe(false);
  });
});
