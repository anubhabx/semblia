import { MemberRole } from "@workspace/database/prisma";

export enum Capability {
  VIEW_PROJECT = "VIEW_PROJECT",
  REVIEW_TESTIMONIALS = "REVIEW_TESTIMONIALS",
  PUBLISH_TESTIMONIALS = "PUBLISH_TESTIMONIALS",
  MANAGE_PUBLISH_SURFACES = "MANAGE_PUBLISH_SURFACES",
  MANAGE_PROJECT = "MANAGE_PROJECT",
  MANAGE_MEMBERS = "MANAGE_MEMBERS",
}

export const ROLE_CAPABILITIES: Record<MemberRole, ReadonlySet<Capability>> = {
  [MemberRole.OWNER]: new Set([
    Capability.VIEW_PROJECT,
    Capability.REVIEW_TESTIMONIALS,
    Capability.PUBLISH_TESTIMONIALS,
    Capability.MANAGE_PUBLISH_SURFACES,
    Capability.MANAGE_PROJECT,
    Capability.MANAGE_MEMBERS,
  ]),
  [MemberRole.ADMIN]: new Set([
    Capability.VIEW_PROJECT,
    Capability.REVIEW_TESTIMONIALS,
    Capability.PUBLISH_TESTIMONIALS,
    Capability.MANAGE_PUBLISH_SURFACES,
    Capability.MANAGE_PROJECT,
    Capability.MANAGE_MEMBERS,
  ]),
  [MemberRole.EDITOR]: new Set([
    Capability.VIEW_PROJECT,
    Capability.REVIEW_TESTIMONIALS,
  ]),
  [MemberRole.VIEWER]: new Set([Capability.VIEW_PROJECT]),
};

export function roleHasCapability(
  role: MemberRole,
  capability: Capability,
): boolean {
  return ROLE_CAPABILITIES[role].has(capability);
}
