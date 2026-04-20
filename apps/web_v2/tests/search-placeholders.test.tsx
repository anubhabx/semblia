import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectsClient } from "@/components/projects/projects-client";
import { TestimonialsClient } from "@/components/testimonials/testimonials-client";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");

  return {
    ...actual,
    apiGetProjects: vi.fn().mockResolvedValue([]),
    apiGetTestimonials: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 8,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    }),
    apiApproveTestimonial: vi.fn().mockResolvedValue(undefined),
    apiRejectTestimonial: vi.fn().mockResolvedValue(undefined),
  };
});

describe("search placeholders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the projects search placeholder with an ellipsis glyph", async () => {
    render(<ProjectsClient />);

    await screen.findByText("Get started by creating your first project.");

    expect(screen.getByLabelText("Search projects")).toHaveAttribute(
      "placeholder",
      "Search projects…",
    );
  });

  it("renders the testimonials search placeholder with an ellipsis glyph", async () => {
    render(<TestimonialsClient projectId="launchpad" />);

    await screen.findByText("No testimonials yet");

    expect(screen.getByLabelText("Search testimonials")).toHaveAttribute(
      "placeholder",
      "Search testimonials…",
    );
  });
});