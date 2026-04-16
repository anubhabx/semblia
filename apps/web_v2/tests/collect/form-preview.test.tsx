import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormPreview } from "@/components/collect/form-preview";
import { DEFAULT_CONFIG } from "@/lib/collect/types";

function make(partial?: Parameters<typeof structuredClone>[0]) {
  return structuredClone({ ...DEFAULT_CONFIG, ...(partial ?? {}) });
}

describe("<FormPreview />", () => {
  it("renders header title, description, and submit button label", () => {
    const config = make();
    render(<FormPreview config={config} />);
    expect(screen.getByText(config.content.headerTitle)).toBeInTheDocument();
    expect(
      screen.getByText(config.content.headerDescription),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: config.content.submitButtonLabel }),
    ).toBeInTheDocument();
  });

  it("hides optional fields when disabled", () => {
    const config = structuredClone(DEFAULT_CONFIG);
    config.fields.rating.enabled = false;
    config.fields.avatar.enabled = false;
    render(<FormPreview config={config} />);
    expect(screen.queryByText("Rating")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile photo")).not.toBeInTheDocument();
  });

  it("shows OAuth buttons when providers are configured", () => {
    const config = structuredClone(DEFAULT_CONFIG);
    config.behavior.oauthProviders = ["google", "github"];
    render(<FormPreview config={config} />);
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with GitHub")).toBeInTheDocument();
  });

  it("renders the Tresta watermark when enabled", () => {
    const config = structuredClone(DEFAULT_CONFIG);
    config.watermark.show = true;
    const { container } = render(<FormPreview config={config} />);
    expect(container.querySelector('[data-slot="watermark"]')).not.toBeNull();
  });

  it("omits the watermark when disabled", () => {
    const config = structuredClone(DEFAULT_CONFIG);
    config.watermark.show = false;
    const { container } = render(<FormPreview config={config} />);
    expect(container.querySelector('[data-slot="watermark"]')).toBeNull();
  });

  it("applies the primary brand color to the submit button", () => {
    const config = structuredClone(DEFAULT_CONFIG);
    config.branding.colors.primary = "#ff0066";
    render(<FormPreview config={config} />);
    const btn = screen.getByRole("button", {
      name: config.content.submitButtonLabel,
    });
    expect(btn.style.backgroundColor).toBe("var(--form-primary)");
    const preview = btn.closest('[data-slot="form-preview"]') as HTMLElement;
    expect(preview.style.getPropertyValue("--form-primary")).toBe("#ff0066");
  });
});
