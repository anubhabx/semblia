import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { V2CollectionFormDTO, V2StudioDraftDTO } from "@workspace/types";
import { StudioDraftProvider } from "@/lib/collect/studio-draft-context";
import { StudioControls } from "@/components/collect/studio/studio-controls";
import { buildDefaultFormConfig } from "@/lib/collect/studio-presets";
import { fetchForm, fetchFormDraft } from "@/lib/tresta-api";

// The studio mounts a large control tree (radix select/dropdown, sliders,
// collapsibles). Cold-importing it in jsdom under full parallel suite load can
// exceed the 5s default; give these renders headroom so the suite is stable.
vi.setConfig({ testTimeout: 20000, hookTimeout: 20000 });

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("session-token"),
    isSignedIn: true,
  }),
}));

vi.mock("@/lib/tresta-api", () => ({
  fetchForm: vi.fn(),
  fetchFormDraft: vi.fn(),
  saveFormDraft: vi.fn(),
}));

// The logo section mounts the full MediaUploader (motion/react + media hooks),
// which is irrelevant to control rendering and slow to cold-import in jsdom.
vi.mock("@/components/media/media-uploader", () => ({
  MediaUploader: () => null,
}));

const SLUG = "test-project";
const FORM_ID = "form_1";

function formDto(): V2CollectionFormDTO {
  return {
    id: FORM_ID,
    projectId: "proj_1",
    entry: {
      id: FORM_ID,
      name: "Default Form",
      description: "",
      isActive: true,
      abWeight: 100,
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
      submissions: 0,
      views: 0,
      responseRate: 0,
      avgRating: 0,
      lastSubmissionAt: null,
    },
    config: buildDefaultFormConfig(),
  };
}

function draftDto(): V2StudioDraftDTO {
  return {
    resourceType: "FORM",
    resourceId: FORM_ID,
    version: 0,
    publishedVersion: null,
    draft: null,
    updatedByUserId: null,
    updatedAt: null,
  };
}

function Harness({ children }: { children: React.ReactNode }) {
  const client = React.useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    [],
  );
  return (
    <QueryClientProvider client={client}>
      <StudioDraftProvider slug={SLUG} formId={FORM_ID}>
        {children}
      </StudioDraftProvider>
    </QueryClientProvider>
  );
}

async function renderControls() {
  const utils = render(
    <Harness>
      <StudioControls />
    </Harness>,
  );
  await waitFor(() => expect(screen.getByText("Form Studio")).not.toBeNull());
  return utils;
}

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
    writable: true,
  });
  vi.mocked(fetchForm).mockReset().mockResolvedValue(formDto());
  vi.mocked(fetchFormDraft).mockReset().mockResolvedValue(draftDto());
});

describe("<StudioControls /> — rendering", () => {
  it("renders the header with Form Studio branding", async () => {
    await renderControls();
    expect(screen.getByText("Form Studio")).not.toBeNull();
    expect(screen.getByText("Brand & style")).not.toBeNull();
  });

  it("renders device toggle pills (Desktop, Tablet, Mobile)", async () => {
    await renderControls();
    expect(screen.getByRole("button", { name: "Desktop" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Tablet" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Mobile" })).not.toBeNull();
  });

  it("renders Remix and Reset buttons", async () => {
    await renderControls();
    expect(screen.getByRole("button", { name: /Remix/ })).not.toBeNull();
    expect(screen.getByRole("button", { name: /Reset/ })).not.toBeNull();
  });

  it("renders collapsible sections", async () => {
    await renderControls();
    // Section titles are unique text nodes (getByText is exact by default).
    // "Questions" carries a count badge, so it is covered by the add-control
    // assertion below instead.
    expect(screen.getByText("Content")).not.toBeNull();
    expect(screen.getByText("Flow & layout")).not.toBeNull();
    expect(screen.getByText("Logo")).not.toBeNull();
    expect(screen.getByText("House styles")).not.toBeNull();
    expect(screen.getByText("Typography")).not.toBeNull();
    expect(screen.getByText("Color")).not.toBeNull();
    expect(screen.getByText("Shape & density")).not.toBeNull();
    expect(screen.getByText("Loading screen")).not.toBeNull();
    expect(screen.getByText("Success screen")).not.toBeNull();
  });
});

describe("<StudioControls /> — section collapse/expand", () => {
  it("collapses a section when clicking its header", async () => {
    await renderControls();
    const layoutBtn = screen.getByRole("button", { name: /House styles/ });
    const section = layoutBtn.parentElement;
    expect(section).toBeTruthy();

    const collapseEl = section!.querySelector(".studio-collapse");
    expect(collapseEl).toBeTruthy();
    expect(collapseEl!.hasAttribute("data-closed")).toBe(false);

    fireEvent.click(layoutBtn);
    expect(collapseEl!.hasAttribute("data-closed")).toBe(true);

    fireEvent.click(layoutBtn);
    expect(collapseEl!.hasAttribute("data-closed")).toBe(false);
  });
});

describe("<StudioControls /> — color & typography", () => {
  it("renders color inputs for each design token", async () => {
    await renderControls();
    // "Ink" and "Accent" also appear as loader-tint pills, so allow >= 1.
    expect(screen.getByText("Background")).not.toBeNull();
    expect(screen.getByText("Surface")).not.toBeNull();
    expect(screen.getAllByText("Ink").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Accent").length).toBeGreaterThan(0);
  });

  it("updates background color via text input", async () => {
    await renderControls();
    const initial = buildDefaultFormConfig();
    const bgInputs = screen.getAllByDisplayValue(initial.tokens.bg);
    fireEvent.change(bgInputs[0], { target: { value: "#ff0000" } });

    await waitFor(() => {
      expect(screen.getAllByDisplayValue("#ff0000").length).toBeGreaterThan(0);
    });
  });
});

describe("<StudioControls /> — preset cards", () => {
  it("renders style preset cards", async () => {
    await renderControls();
    expect(screen.getByText("Editorial")).not.toBeNull();
    expect(screen.getByText("Neo-Brutalist")).not.toBeNull();
    expect(screen.getAllByText("Soft").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Noir")).not.toBeNull();
  });

  it("applies a preset when clicked", async () => {
    await renderControls();
    const noirBtn = screen.getByText("Noir").closest("button")!;
    fireEvent.click(noirBtn);

    await waitFor(() => {
      // The Noir card should become selected (border-foreground)
      expect(noirBtn.className).toMatch(/border-foreground/);
    });
  });
});

describe("<StudioControls /> — form builder surfaces", () => {
  it("renders the question builder add-control", async () => {
    await renderControls();
    expect(screen.getByRole("button", { name: /Add question/ })).not.toBeNull();
  });

  it("renders content fields for the form copy", async () => {
    await renderControls();
    expect(screen.getByText("Headline")).not.toBeNull();
    expect(screen.getByText("Submit button")).not.toBeNull();
  });
});

describe("<StudioControls /> — pills toggle", () => {
  it("switches device via Pills toggle", async () => {
    await renderControls();

    const tablet = screen.getByRole("button", { name: "Tablet" });
    fireEvent.click(tablet);
    await waitFor(() => expect(tablet.className).toMatch(/bg-primary/));

    const mobile = screen.getByRole("button", { name: "Mobile" });
    fireEvent.click(mobile);
    await waitFor(() => expect(mobile.className).toMatch(/bg-primary/));
  });
});
