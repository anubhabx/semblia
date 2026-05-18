import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { V2CreatedApiKeyDTO } from "@workspace/types";
import { CreateKeyDialog } from "@/components/developers/keys/create-key-dialog";
import { createApiKey } from "@/lib/tresta-api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/launchpad/developers/keys",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("session-token"),
    isSignedIn: true,
  }),
}));

vi.mock("@/lib/tresta-api", () => ({
  createApiKey: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const SECRET: V2CreatedApiKeyDTO = {
  id: "key_new",
  name: "Production embed",
  type: "SECRET",
  keyType: "SECRET",
  prefix: "sk_test",
  keyPrefix: "sk_test",
  lastFour: "wxyz",
  userId: "user_1",
  projectId: "project_1",
  permissions: null,
  scopes: [
    "project:read",
    "submissions:read",
    "testimonials:read",
    "analytics:read",
  ],
  usageCount: 0,
  usageLimit: null,
  rateLimit: 60,
  status: "ACTIVE",
  isActive: true,
  lastUsedAt: null,
  expiresAt: null,
  revokedAt: null,
  createdAt: "2026-05-18T00:00:00.000Z",
  updatedAt: "2026-05-18T00:00:00.000Z",
  secret: "sk_test_PLAINTEXT_SECRET_VALUE",
  key: "sk_test_PLAINTEXT_SECRET_VALUE",
};

function checkboxById(id: string): HTMLElement {
  // Radix Checkbox.Root renders a button with role="checkbox" and the id
  // we pass through. Avoid getByLabelText because the wrapping label's
  // accessible text concatenates the scope name with its description.
  const el = document.getElementById(id);
  if (!el) throw new Error(`No checkbox element with id ${id}`);
  return el;
}

describe("CreateKeyDialog scope selector", () => {
  it("pre-selects the backend default scopes", async () => {
    render(
      <CreateKeyDialog
        open
        initialType="SECRET"
        slug="launchpad"
        onOpenChange={() => {}}
      />,
      { wrapper },
    );

    await screen.findByLabelText(/key name/i);

    expect(
      checkboxById("scope-project:read").getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      checkboxById("scope-submissions:read").getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      checkboxById("scope-testimonials:read").getAttribute("aria-checked"),
    ).toBe("true");

    expect(
      checkboxById("scope-analytics:read").getAttribute("aria-checked"),
    ).toBe("false");
    expect(
      checkboxById("scope-webhooks:write").getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("submits the user-selected scopes to createApiKey", async () => {
    vi.mocked(createApiKey).mockResolvedValueOnce(SECRET);

    render(
      <CreateKeyDialog
        open
        initialType="SECRET"
        slug="launchpad"
        onOpenChange={() => {}}
      />,
      { wrapper },
    );

    await userEvent.type(
      await screen.findByLabelText(/key name/i),
      "Production embed",
    );

    await userEvent.click(checkboxById("scope-analytics:read"));

    await userEvent.click(screen.getByRole("button", { name: /create key/i }));

    await waitFor(() =>
      expect(createApiKey).toHaveBeenCalledWith(
        "session-token",
        "launchpad",
        expect.objectContaining({
          name: "Production embed",
          scopes: expect.arrayContaining([
            "project:read",
            "submissions:read",
            "testimonials:read",
            "analytics:read",
          ]),
        }),
      ),
    );

    const passed = vi.mocked(createApiKey).mock.calls[0]![2] as {
      scopes: string[];
    };
    expect(passed.scopes).toHaveLength(4);
  });
});
