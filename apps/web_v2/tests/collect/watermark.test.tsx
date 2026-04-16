import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Watermark } from "@/components/collect/watermark";

describe("<Watermark />", () => {
  it("renders powered-by text", () => {
    const { getByText } = render(<Watermark position="bottom-right" />);
    expect(getByText(/Powered by Tresta/i)).toBeInTheDocument();
  });

  it("anchors to the correct corner via class names", () => {
    const right = render(<Watermark position="bottom-right" />);
    expect(right.container.firstChild).toHaveClass("right-3");

    const left = render(<Watermark position="bottom-left" />);
    expect(left.container.firstChild).toHaveClass("left-3");

    const center = render(<Watermark position="bottom-center" />);
    expect(center.container.firstChild).toHaveClass("-translate-x-1/2");
  });
});
