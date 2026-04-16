import type { MockProject } from "@/lib/mock-data";

export function makeProject(overrides: Partial<MockProject> = {}): MockProject {
  return {
    id: "proj_test",
    userId: "user_test",
    name: "Test Project",
    shortDescription: null,
    description: null,
    slug: "test-project",
    logoUrl: null,
    projectType: "SAAS_APP",
    websiteUrl: null,
    collectionFormUrl: null,
    brandColorPrimary: "#6366f1",
    brandColorSecondary: "#f59e0b",
    socialLinks: null,
    tags: [],
    visibility: "PUBLIC",
    isActive: true,
    autoModeration: true,
    autoApproveVerified: false,
    profanityFilterLevel: null,
    formConfig: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    _count: {
      testimonials: 0,
      pendingModeration: 0,
      widgets: 0,
    },
    ...overrides,
  } as MockProject;
}
