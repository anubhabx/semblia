import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { V2PaymentMethodDTO } from "@workspace/types";
import { PaymentMethodsSection } from "@/components/account/payment-method-row";
import { usePaymentMethods } from "@/hooks/api";

vi.mock("@/hooks/api", () => ({
  usePaymentMethods: vi.fn(),
}));

function paymentMethod(
  overrides: Partial<V2PaymentMethodDTO> = {},
): V2PaymentMethodDTO {
  return {
    id: "pm_1",
    brand: "visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2030,
    isDefault: true,
    ...overrides,
  };
}

function paymentMethodsQuery(methods: V2PaymentMethodDTO[]) {
  return {
    data: methods,
    dataUpdatedAt: Date.now(),
    isFetching: false,
    isPending: false,
    isRefetching: false,
  } as unknown as ReturnType<typeof usePaymentMethods>;
}

describe("PaymentMethodsSection", () => {
  it("renders saved cards as read-only rows with no actions menu", async () => {
    vi.mocked(usePaymentMethods).mockReturnValue(
      paymentMethodsQuery([paymentMethod()]),
    );

    render(<PaymentMethodsSection />);

    expect(screen.getByText(/Visa .*4242/i)).toBeTruthy();
    expect(screen.getByText("Default")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /payment method options/i }),
    ).toBeNull();

    const addCardButton = screen.getByRole("button", { name: /add card/i });
    expect(addCardButton.hasAttribute("disabled")).toBe(true);
    await userEvent.hover(addCardButton.parentElement ?? addCardButton);
    expect(
      (
        await screen.findAllByText(
          "Cards are saved automatically after your next paid charge.",
        )
      ).length,
    ).toBeGreaterThan(0);
  });

  it("uses the paid-charge empty state copy", async () => {
    vi.mocked(usePaymentMethods).mockReturnValue(paymentMethodsQuery([]));

    render(<PaymentMethodsSection />);

    await waitFor(() =>
      expect(
        screen.getByText(
          "No saved cards yet. We'll save your card here after your first paid charge.",
        ),
      ).toBeTruthy(),
    );
  });
});
