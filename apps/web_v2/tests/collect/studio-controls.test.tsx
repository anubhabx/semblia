import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { useStudioStore } from "@/lib/collect/studio-store";
import { StudioControls } from "@/components/collect/studio/studio-controls";

const SLUG = "test-project";
let formId: string;

beforeEach(() => {
  // Reset store between tests
  useStudioStore.setState({
    formsByProject: {},
    snapshots: {},
    device: "desktop",
  });
  formId = useStudioStore.getState().ensureProject(SLUG);
});

describe("<StudioControls /> — rendering", () => {
  it("renders the header with Tresta Studio branding", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByText("Tresta Studio")).toBeInTheDocument();
    expect(screen.getByText(/v0\.5/)).toBeInTheDocument();
  });

  it("renders device toggle pills (Desktop, Tablet, Mobile)", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByRole("button", { name: "Desktop" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tablet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mobile" })).toBeInTheDocument();
  });

  it("renders Remix and Reset buttons", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByRole("button", { name: /Remix/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reset/ })).toBeInTheDocument();
  });

  it("renders collapsible sections", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByText("Layout")).toBeInTheDocument();
    expect(screen.getByText("House styles")).toBeInTheDocument();
    expect(screen.getByText("Typography")).toBeInTheDocument();
    expect(screen.getByText("Color")).toBeInTheDocument();
    expect(screen.getByText("Shape & density")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Questions & Logic")).toBeInTheDocument();
  });

  it("returns null when formId has no snapshot", () => {
    const { container } = render(<StudioControls formId="nonexistent" />);
    expect(container.innerHTML).toBe("");
  });
});

describe("<StudioControls /> — select components", () => {
  it("renders Flow select with correct options", () => {
    render(<StudioControls formId={formId} />);
    const flowSelect = screen.getByDisplayValue("All at once");
    expect(flowSelect).toBeInTheDocument();
    expect(flowSelect.tagName).toBe("SELECT");

    const options = within(flowSelect as HTMLElement).getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.textContent)).toEqual([
      "All at once",
      "Stepped",
      "Cards",
      "Conversational",
    ]);
  });

  it("renders Container select with correct options", () => {
    render(<StudioControls formId={formId} />);
    const containerSelect = screen.getByDisplayValue("Boxed");
    expect(containerSelect).toBeInTheDocument();

    const options = within(containerSelect as HTMLElement).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([
      "Boxed",
      "Split",
      "Fullbleed",
      "Centered",
    ]);
  });

  it("updates store when Flow select changes", () => {
    render(<StudioControls formId={formId} />);
    const flowSelect = screen.getByDisplayValue("All at once");
    fireEvent.change(flowSelect, { target: { value: "stepped" } });

    const snap = useStudioStore.getState().snapshots[formId];
    expect(snap?.draft.layout.flow).toBe("stepped");
  });
});

describe("<StudioControls /> — section collapse/expand", () => {
  it("collapses a section when clicking its header", () => {
    render(<StudioControls formId={formId} />);
    // Layout starts open by default
    const layoutBtn = screen.getByRole("button", { name: /Layout/ });
    // The collapse inner has content
    const section = layoutBtn.closest("[class*='border-t']");
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

  it("Community section starts collapsed (defaultOpen=false)", () => {
    render(<StudioControls formId={formId} />);
    const communityBtn = screen.getByRole("button", { name: /Community/ });
    const section = communityBtn.closest("[class*='border-t']");
    const collapseEl = section!.querySelector(".studio-collapse");
    expect(collapseEl!.hasAttribute("data-closed")).toBe(true);
  });
});

function getQuestionCollapses(container: HTMLElement) {
  // Question row collapses are .studio-collapse elements that are NOT inside a section
  // (section collapses live in border-t containers, question collapses live in cards)
  return Array.from(container.querySelectorAll(".studio-collapse")).filter(
    (el) => el.closest(".studio-collapse")?.parentElement?.querySelector(".studio-collapse-inner") === el.querySelector(".studio-collapse-inner")
  );
}

describe("<StudioControls /> — question row accordion", () => {
  it("renders all question rows collapsed by default", () => {
    render(<StudioControls formId={formId} />);
    const editButtons = screen.getAllByRole("button", { name: "✎" });
    expect(editButtons.length).toBeGreaterThan(0);

    // Each edit button's parent card should have a collapse with data-closed
    editButtons.forEach((btn) => {
      // Walk up to find the studio-collapse sibling
      const parent = btn.parentElement;
      const collapseEl = parent?.parentElement?.querySelector(".studio-collapse");
      expect(collapseEl).toBeTruthy();
      expect(collapseEl!.hasAttribute("data-closed")).toBe(true);
    });
  });

  it("expands a question row when clicking ✎ and collapses on ✕", () => {
    render(<StudioControls formId={formId} />);
    const editButtons = screen.getAllByRole("button", { name: "✎" });
    const firstEditBtn = editButtons[0];
    const parent = firstEditBtn.parentElement;
    const collapseEl = parent?.parentElement?.querySelector(".studio-collapse");

    // Click to expand
    fireEvent.click(firstEditBtn);
    expect(firstEditBtn.textContent).toBe("✕");
    expect(collapseEl!.hasAttribute("data-closed")).toBe(false);

    // Click to collapse
    fireEvent.click(firstEditBtn);
    expect(firstEditBtn.textContent).toBe("✎");
    expect(collapseEl!.hasAttribute("data-closed")).toBe(true);
  });

  it("allows multiple question rows open simultaneously", () => {
    render(<StudioControls formId={formId} />);
    const editButtons = screen.getAllByRole("button", { name: "✎" });
    expect(editButtons.length).toBeGreaterThanOrEqual(2);

    // Open first and second
    fireEvent.click(editButtons[0]);
    fireEvent.click(editButtons[1]);

    const collapse0 = editButtons[0].parentElement?.parentElement?.querySelector(".studio-collapse");
    const collapse1 = editButtons[1].parentElement?.parentElement?.querySelector(".studio-collapse");
    expect(collapse0!.hasAttribute("data-closed")).toBe(false);
    expect(collapse1!.hasAttribute("data-closed")).toBe(false);
  });

  it("updates question label via inline edit", () => {
    render(<StudioControls formId={formId} />);
    const editButtons = screen.getAllByRole("button", { name: "✎" });
    fireEvent.click(editButtons[0]);

    // Find the label input inside the expanded row
    const snap = useStudioStore.getState().snapshots[formId]!;
    const originalLabel = snap.draft.questions[0].label;
    const labelInput = screen.getByDisplayValue(originalLabel);
    expect(labelInput).toBeInTheDocument();

    fireEvent.change(labelInput, { target: { value: "Updated question" } });
    const updated = useStudioStore.getState().snapshots[formId]!;
    expect(updated.draft.questions[0].label).toBe("Updated question");
  });

  it("deletes a question via Delete button", () => {
    render(<StudioControls formId={formId} />);
    const countBefore = useStudioStore.getState().snapshots[formId]!.draft.questions.length;

    const editButtons = screen.getAllByRole("button", { name: "✎" });
    fireEvent.click(editButtons[0]);

    const deleteBtn = screen.getAllByRole("button", { name: "Delete" })[0];
    fireEvent.click(deleteBtn);

    const countAfter = useStudioStore.getState().snapshots[formId]!.draft.questions.length;
    expect(countAfter).toBe(countBefore - 1);
  });

  it("adds a new question via + Add question", () => {
    render(<StudioControls formId={formId} />);
    const countBefore = useStudioStore.getState().snapshots[formId]!.draft.questions.length;

    const addBtn = screen.getByRole("button", { name: /Add question/ });
    fireEvent.click(addBtn);

    // Type picker grid should appear
    const shortTextBtn = screen.getByRole("button", { name: "Short text" });
    expect(shortTextBtn).toBeInTheDocument();

    fireEvent.click(shortTextBtn);
    const countAfter = useStudioStore.getState().snapshots[formId]!.draft.questions.length;
    expect(countAfter).toBe(countBefore + 1);
    expect(
      useStudioStore.getState().snapshots[formId]!.draft.questions.at(-1)?.type,
    ).toBe("shorttext");
  });
});

describe("<StudioControls /> — color & typography", () => {
  it("renders color inputs for each design token", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByText("Background")).toBeInTheDocument();
    expect(screen.getByText("Surface")).toBeInTheDocument();
    expect(screen.getByText("Ink")).toBeInTheDocument();
    expect(screen.getByText("Accent")).toBeInTheDocument();
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
    expect(screen.getByText("Editorial")).toBeInTheDocument();
    expect(screen.getByText("Neo-Brutalist")).toBeInTheDocument();
    // "Soft" may appear elsewhere (e.g. Shadow "Soft" pill), so use getAllByText
    expect(screen.getAllByText("Soft").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Noir")).toBeInTheDocument();
  });

  it("applies a preset when clicked", () => {
    render(<StudioControls formId={formId} />);
    const noirBtn = screen.getByText("Noir").closest("button")!;
    fireEvent.click(noirBtn);

    const snap = useStudioStore.getState().snapshots[formId]!;
    expect(snap.draft.preset).toBe("noir");
  });
});

describe("<StudioControls /> — layout thumbnails", () => {
  it("renders layout thumbnail buttons", () => {
    render(<StudioControls formId={formId} />);
    expect(screen.getByText("Classic")).toBeInTheDocument();
    expect(screen.getByText("Hero Split")).toBeInTheDocument();
    // "Stepped" appears in both layout thumbnails and Flow select options
    expect(screen.getAllByText("Stepped").length).toBeGreaterThanOrEqual(1);
  });

  it("switches layout preset on click", () => {
    render(<StudioControls formId={formId} />);
    // Use getAllByText and find the one that is a direct child of a layout button
    const steppedEls = screen.getAllByText("Stepped");
    const steppedBtn = steppedEls
      .map((el) => el.closest("button"))
      .find((btn) => btn && btn.querySelector("svg"))!;
    fireEvent.click(steppedBtn);

    const snap = useStudioStore.getState().snapshots[formId]!;
    expect(snap.draft.layoutPreset).toBe("stepped");
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
