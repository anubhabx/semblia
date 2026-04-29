import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { apiGetProjects } from "@/lib/api";
import { ProjectsClient } from "@/components/projects/projects-client";
import { TestimonialsClient } from "@/components/testimonials/testimonials-client";

import { makeProject } from "./helpers/fixtures";

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
    vi.mocked(apiGetProjects).mockResolvedValueOnce([makeProject()]);

    render(<ProjectsClient />);

    await screen.findByLabelText("Search projects");

    expect(
      screen.getByLabelText("Search projects").getAttribute("placeholder"),
    ).toBe("Search projects…");
  });

  it("renders the testimonials search placeholder with an ellipsis glyph", async () => {
    render(<TestimonialsClient projectId="launchpad" status="ALL" />);

    await screen.findByText("No testimonials yet");

    expect(
      screen.getByLabelText("Search testimonials").getAttribute("placeholder"),
    ).toBe("Search testimonials…");
  });
});
