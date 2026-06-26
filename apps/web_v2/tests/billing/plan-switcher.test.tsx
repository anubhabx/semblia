import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type {
  V2SubscriptionDTO,
  V2UserDTO,
  V2UserPlan,
} from "@workspace/types";
import { PlanSwitcher } from "@/components/account/plan-switcher";
import {
  billingQueryKeys,
  useCancelSubscription,
  useCreateCheckoutSession,
  useSubscription,
  useSwitchPlan,
} from "@/hooks/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { openSubscriptionCheckout } from "@/lib/razorpay-checkout";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/razorpay-checkout", () => ({
  openSubscriptionCheckout: vi.fn(),
}));

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("@/hooks/api", () => ({
  billingQueryKeys: {
    subscription: ["account", "subscription"],
    usage: ["account", "usage"],
  },
  useSubscription: vi.fn(),
  useCreateCheckoutSession: vi.fn(),
  useSwitchPlan: vi.fn(),
  useCancelSubscription: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function subscription(overrides: Partial<V2SubscriptionDTO> = {}) {
  return {
    id: "local_sub_1",
    userId: "user_1",
    status: "active",
    userPlan: "FREE",
    currentPeriodStart: "2026-05-01T00:00:00.000Z",
    currentPeriodEnd: "2026-06-01T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    amount: 0,
    currency: "INR",
    interval: "month",
    ...overrides,
  } satisfies V2SubscriptionDTO;
}

function subscriptionQuery(plan: V2UserPlan) {
  return {
    data: subscription({
      userPlan: plan,
      amount: plan === "FREE" ? 0 : 79900,
    }),
    dataUpdatedAt: Date.now(),
    isFetching: false,
    isPending: false,
    isRefetching: false,
  };
}

const currentUser: V2UserDTO = {
  id: "user_1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  avatar: null,
  plan: "FREE",
  onboardingStep: "COMPLETED",
  onboardingData: null,
  onboardingCompletedAt: "2026-05-01T00:00:00.000Z",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

describe("PlanSwitcher billing transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateCheckoutSession).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({
        subscriptionId: "rzp_sub_123",
        shortUrl: "https://rzp.io/i/sub_123",
        razorpayKeyId: "rzp_test_key",
        planId: "PRO",
      }),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateCheckoutSession>);
    vi.mocked(useSwitchPlan).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(subscription({ userPlan: "PRO" })),
      isPending: false,
    } as unknown as ReturnType<typeof useSwitchPlan>);
    vi.mocked(useCancelSubscription).mockReturnValue({
      mutateAsync: vi
        .fn()
        .mockResolvedValue(
          subscription({ userPlan: "PRO", cancelAtPeriodEnd: true }),
        ),
      isPending: false,
    } as unknown as ReturnType<typeof useCancelSubscription>);
    vi.mocked(useCurrentUser).mockReturnValue({
      data: currentUser,
    } as unknown as ReturnType<typeof useCurrentUser>);
    vi.mocked(openSubscriptionCheckout).mockResolvedValue(undefined);
  });

  it("opens Razorpay Checkout when moving from FREE to a paid plan", async () => {
    vi.mocked(useSubscription).mockReturnValue(
      subscriptionQuery("FREE") as unknown as ReturnType<
        typeof useSubscription
      >,
    );

    render(<PlanSwitcher />, { wrapper });

    await userEvent.click(
      screen.getByRole("button", { name: "Switch to Pro" }),
    );
    expect(
      await screen.findByText(/redirected to Razorpay Checkout/i),
    ).toBeTruthy();

    await userEvent.click(
      screen.getByRole("button", { name: "Continue to Razorpay" }),
    );

    await waitFor(() =>
      expect(useCreateCheckoutSession().mutateAsync).toHaveBeenCalledWith(
        "PRO",
      ),
    );
    expect(openSubscriptionCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: "rzp_sub_123",
        razorpayKeyId: "rzp_test_key",
        shortUrl: "https://rzp.io/i/sub_123",
        prefill: {
          name: "Ada Lovelace",
          email: "ada@example.com",
        },
      }),
    );
    expect(useSwitchPlan().mutateAsync).not.toHaveBeenCalled();
    expect(useCancelSubscription().mutateAsync).not.toHaveBeenCalled();
  });

  it("schedules a plan switch without loading Razorpay when moving between paid plans", async () => {
    vi.mocked(useSubscription).mockReturnValue(
      subscriptionQuery("PRO") as unknown as ReturnType<typeof useSubscription>,
    );

    render(<PlanSwitcher />, { wrapper });

    await userEvent.click(
      screen.getByRole("button", { name: "Switch to Business" }),
    );
    expect(await screen.findByText(/No charge today/i)).toBeTruthy();

    await userEvent.click(
      screen.getByRole("button", { name: "Schedule plan switch" }),
    );

    await waitFor(() =>
      expect(useSwitchPlan().mutateAsync).toHaveBeenCalledWith("BUSINESS"),
    );
    expect(openSubscriptionCheckout).not.toHaveBeenCalled();
    expect(useCreateCheckoutSession().mutateAsync).not.toHaveBeenCalled();
  });

  it("cancels the subscription when moving from a paid plan to FREE", async () => {
    vi.mocked(useSubscription).mockReturnValue(
      subscriptionQuery("PRO") as unknown as ReturnType<typeof useSubscription>,
    );

    render(<PlanSwitcher />, { wrapper });

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel subscription" }),
    );
    expect(await screen.findByText(/will cancel at the end/i)).toBeTruthy();

    await userEvent.click(
      screen.getAllByRole("button", { name: "Cancel subscription" }).at(-1)!,
    );

    await waitFor(() =>
      expect(useCancelSubscription().mutateAsync).toHaveBeenCalledWith(),
    );
    expect(useSwitchPlan().mutateAsync).not.toHaveBeenCalled();
    expect(openSubscriptionCheckout).not.toHaveBeenCalled();
    expect(billingQueryKeys.subscription).toEqual(["account", "subscription"]);
  });
});
