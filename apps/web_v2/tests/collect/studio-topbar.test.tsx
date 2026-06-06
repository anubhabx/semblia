import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StudioTopbar } from "@/components/collect/studio/studio-topbar";

function renderTopbar(
  overrides: Partial<React.ComponentProps<typeof StudioTopbar>> = {},
) {
  const onPublish = vi.fn();
  const onSave = vi.fn();
  const onReset = vi.fn();
  const onClose = vi.fn();
  render(
    <StudioTopbar
      onClose={onClose}
      isDesktop
      sidebarOpen
      setSidebarOpen={vi.fn()}
      dirty={false}
      onReset={onReset}
      onSave={onSave}
      onPublish={onPublish}
      {...overrides}
    />,
  );
  return { onPublish, onSave, onReset, onClose };
}

describe("<StudioTopbar /> — publish control", () => {
  it("disables Publish when there are no pending or unpublished changes", () => {
    renderTopbar();
    const button = screen.getByRole("button", {
      name: /publish/i,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("enables Publish and fires onPublish when there are unsaved edits", async () => {
    const { onPublish } = renderTopbar({ dirty: true });
    const button = screen.getByRole("button", {
      name: /publish/i,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    await userEvent.click(button);
    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it("enables Publish from a saved-but-unpublished draft", () => {
    renderTopbar({ dirty: false, hasUnpublishedChanges: true });
    const button = screen.getByRole("button", {
      name: /publish/i,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(screen.getByText(/unpublished/i)).toBeTruthy();
  });

  it("shows a busy state and stays disabled while publishing", () => {
    renderTopbar({ dirty: true, isPublishing: true });
    const button = screen.getByRole("button", {
      name: /publishing/i,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
