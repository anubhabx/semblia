import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { V2UserDTO } from "@workspace/types";
import {
  useCurrentUser,
  useUpdateOnboardingProgress,
} from "@/hooks/use-current-user";
import { fetchCurrentUser, updateOnboardingProgress } from "@/lib/tresta-api";

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("session-token"),
    isSignedIn: true,
  }),
}));

vi.mock("@/lib/tresta-api", () => ({
  fetchCurrentUser: vi.fn(),
  updateCurrentUser: vi.fn(),
  updateOnboardingProgress: vi.fn(),
  completeOnboarding: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useCurrentUser", () => {
  it("loads the current user through the typed v2 client", async () => {
    const user: V2UserDTO = {
      id: "user_1",
      email: "test+clerk_test@tresta.app",
      firstName: "Test",
      lastName: "User",
      avatar: null,
      plan: "PRO",
      onboardingStep: "PROFILE",
      onboardingData: null,
      onboardingCompletedAt: null,
      createdAt: "2026-05-13T00:00:00.000Z",
      updatedAt: "2026-05-13T00:00:00.000Z",
    };
    vi.mocked(fetchCurrentUser).mockResolvedValue(user);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(user));
    expect(fetchCurrentUser).toHaveBeenCalledWith("session-token");
  });

  it("updates onboarding progress through the typed v2 client", async () => {
    const user: V2UserDTO = {
      id: "user_1",
      email: "test+clerk_test@tresta.app",
      firstName: "Test",
      lastName: "User",
      avatar: null,
      plan: "PRO",
      onboardingStep: "INTENT",
      onboardingData: {
        referral: { source: "search" },
      },
      onboardingCompletedAt: null,
      createdAt: "2026-05-13T00:00:00.000Z",
      updatedAt: "2026-05-13T00:00:00.000Z",
    };
    vi.mocked(updateOnboardingProgress).mockResolvedValue(user);

    const { result } = renderHook(() => useUpdateOnboardingProgress(), {
      wrapper,
    });

    await result.current.mutateAsync({
      step: "INTENT",
      data: { referral: { source: "search" } },
    });

    expect(updateOnboardingProgress).toHaveBeenCalledWith("session-token", {
      step: "INTENT",
      data: { referral: { source: "search" } },
    });
  });
});
