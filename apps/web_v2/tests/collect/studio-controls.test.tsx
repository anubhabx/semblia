import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useStudioStore } from "@/lib/collect/studio-store";
import { StudioControls } from "@/components/collect/studio/studio-controls";

const SLUG = "test-project";
let formId: string;

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
    writable: true,
  });

  // Reset store between tests
  useStudioStore.setState({
    formsByProject: {},
    snapshots: {},
    device: "desktop",
  });
  formId = useStudioStore.getState().ensureProject(SLUG);
});

describe("<StudioControls /> — rendering", () => {
  it("renders the header with Form Studio branding", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByText("Form Studio")).not.toBeNull();
    expect(screen.getByText(/v0\.5/)).not.toBeNull();
  });

  it("renders device toggle pills (Desktop, Tablet, Mobile)", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByRole("button", { name: "Desktop" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Tablet" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Mobile" })).not.toBeNull();
  });

  it("renders Remix and Reset buttons", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByRole("button", { name: /Remix/ })).not.toBeNull();
    expect(screen.getByRole("button", { name: /Reset/ })).not.toBeNull();
  });

  it("renders collapsible sections", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByText("House styles")).not.toBeNull();
    expect(screen.getByText("Typography")).not.toBeNull();
    expect(screen.getByText("Color")).not.toBeNull();
    expect(screen.getByText("Shape & density")).not.toBeNull();
    expect(
      screen.getByText("Static shell mode. Styling controls only."),
    ).not.toBeNull();
    expect(screen.queryByText("Layout")).toBeNull();
    expect(screen.queryByText("Content")).toBeNull();
    expect(screen.queryByText("Questions & Logic")).toBeNull();
  });

  it("returns null when formId has no snapshot", () => {
    const { container } = render(<StudioControls formId="nonexistent" />);
    expect(container.innerHTML).toBe("");
  });
});

describe("<StudioControls /> — section collapse/expand", () => {
  it("collapses a section when clicking its header", () => {
    render(<StudioControls formId={formId} />);
    const layoutBtn = screen.getByRole("button", { name: /House styles/ });
    // The collapse inner has content
    const section = layoutBtn.parentElement;
    expect(section).toBeTruthy();

    // Find the collapse element
    const collapseEl = section!.querySelector(".studio-collapse");
    expect(collapseEl).toBeTruthy();
    expect(collapseEl!.hasAttribute("data-closed")).toBe(false);

    // Click to collapse
    fireEvent.click(layoutBtn);
    expect(collapseEl!.hasAttribute("data-closed")).toBe(true);

    // Click to expand
    fireEvent.click(layoutBtn);
    expect(collapseEl!.hasAttribute("data-closed")).toBe(false);
  });
});

describe("<StudioControls /> — color & typography", () => {
  it("renders color inputs for each design token", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByText("Background")).not.toBeNull();
    expect(screen.getByText("Surface")).not.toBeNull();
    expect(screen.getByText("Ink")).not.toBeNull();
    expect(screen.getByText("Accent")).not.toBeNull();
  });

  it("updates background color via text input", () => {
    render(<StudioControls formId={formId} />);
    const snap = useStudioStore.getState().snapshots[formId]!;
    // bg value may appear in multiple inputs (bg + surface can share the same hex),
    // so use getAllByDisplayValue and pick the first one (which is the Background input)
    const bgInputs = screen.getAllByDisplayValue(snap.draft.tokens.bg);
    fireEvent.change(bgInputs[0], { target: { value: "#ff0000" } });

    const updated = useStudioStore.getState().snapshots[formId]!;
    expect(updated.draft.tokens.bg).toBe("#ff0000");
  });
});

describe("<StudioControls /> — preset cards", () => {
  it("renders style preset cards", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByText("Editorial")).not.toBeNull();
    expect(screen.getByText("Neo-Brutalist")).not.toBeNull();
    // "Soft" may appear elsewhere (e.g. Shadow "Soft" pill), so use getAllByText
    expect(screen.getAllByText("Soft").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Noir")).not.toBeNull();
  });

  it("applies a preset when clicked", () => {
    render(<StudioControls formId={formId} />);
    const noirBtn = screen.getByText("Noir").closest("button")!;
    fireEvent.click(noirBtn);

    const snap = useStudioStore.getState().snapshots[formId]!;
    expect(snap.draft.preset).toBe("noir");
  });
});

describe("<StudioControls /> — removed form builder surfaces", () => {
  it("does not render layout thumbnails or question controls", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.queryByText("Classic")).toBeNull();
    expect(screen.queryByText("Hero Split")).toBeNull();
    expect(screen.queryByRole("button", { name: /Add question/ })).toBeNull();
  });
});

describe("<StudioControls /> — pills toggle", () => {
  it("switches device via Pills toggle", () => {
    render(<StudioControls formId={formId} />);

    expect(useStudioStore.getState().device).toBe("desktop");
    fireEvent.click(screen.getByRole("button", { name: "Tablet" }));
    expect(useStudioStore.getState().device).toBe("tablet");
    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    expect(useStudioStore.getState().device).toBe("mobile");
  });
});
