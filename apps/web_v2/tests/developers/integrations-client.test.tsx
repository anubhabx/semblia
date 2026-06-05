import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { V2IntegrationConnectionDTO } from "@workspace/types";
import {
  fetchIntegrationConnections,
  createIntegrationConnection,
  updateIntegrationConnection,
  disableIntegrationConnection,
  createNativeIntegrationExport,
} from "@/lib/tresta-api";
import { IntegrationsClient } from "@/components/developers/integrations/integrations-client";

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("session-token"),
    isSignedIn: true,
  }),
}));

vi.mock("@/lib/tresta-api", () => ({
  fetchIntegrationConnections: vi.fn(),
  createIntegrationConnection: vi.fn(),
  updateIntegrationConnection: vi.fn(),
  disableIntegrationConnection: vi.fn(),
  createNativeIntegrationExport: vi.fn(),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

function connection(
  overrides: Partial<V2IntegrationConnectionDTO> = {},
): V2IntegrationConnectionDTO {
  return {
    id: "conn_1",
    projectId: "proj_1",
    provider: "SLACK",
    authStrategy: "CLERK_OAUTH",
    connectedByUserId: "user_1",
    clerkProvider: "slack",
    externalAccountId: null,
    status: "ACTIVE",
    scopes: [],
    config: { channelId: "C0123456789" },
    lastCheckedAt: null,
    createdAt: "2026-06-04T10:10:00.000Z",
    updatedAt: "2026-06-04T10:10:00.000Z",
    ...overrides,
  };
}

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe("IntegrationsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an empty state and provider cards when nothing is connected", async () => {
    vi.mocked(fetchIntegrationConnections).mockResolvedValue([]);

    renderWithQuery(<IntegrationsClient slug="launchpad" />);

    expect(await screen.findByText("No integrations connected")).toBeTruthy();
    // All four provider connect cards are offered.
    expect(screen.getByText("Slack")).toBeTruthy();
    expect(screen.getByText("Notion")).toBeTruthy();
    expect(screen.getByText("Linear")).toBeTruthy();
    expect(screen.getByText("GitHub")).toBeTruthy();
  });

  it("lists a connection with its destination summary", async () => {
    vi.mocked(fetchIntegrationConnections).mockResolvedValue([connection()]);

    renderWithQuery(<IntegrationsClient slug="launchpad" />);

    expect(await screen.findByText("#C0123456789")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /edit destination/i }),
    ).toBeTruthy();
  });

  it("connects a provider through the connect dialog", async () => {
    vi.mocked(fetchIntegrationConnections).mockResolvedValue([]);
    vi.mocked(createIntegrationConnection).mockResolvedValue(connection());

    renderWithQuery(<IntegrationsClient slug="launchpad" />);

    await screen.findByText("No integrations connected");

    // Open the Slack connect dialog.
    await userEvent.click(screen.getByText("Slack"));
    const channelInput = await screen.findByLabelText(/channel id/i);
    await userEvent.type(channelInput, "C9999999999");
    await userEvent.click(
      screen.getByRole("button", { name: /connect slack/i }),
    );

    await waitFor(() => {
      expect(createIntegrationConnection).toHaveBeenCalledWith(
        "session-token",
        "launchpad",
        { provider: "SLACK", config: { channelId: "C9999999999" } },
      );
    });
  });

  it("sends a test export for an active connection", async () => {
    vi.mocked(fetchIntegrationConnections).mockResolvedValue([connection()]);
    vi.mocked(createNativeIntegrationExport).mockResolvedValue({} as never);

    renderWithQuery(<IntegrationsClient slug="launchpad" />);

    await screen.findByText("#C0123456789");
    await userEvent.click(screen.getByRole("button", { name: /send test/i }));

    await waitFor(() => {
      expect(createNativeIntegrationExport).toHaveBeenCalledWith(
        "session-token",
        "launchpad",
        "conn_1",
        expect.objectContaining({ eventType: "submission.created" }),
      );
    });
  });

  it("disables a connection after confirmation", async () => {
    vi.mocked(fetchIntegrationConnections).mockResolvedValue([connection()]);
    vi.mocked(disableIntegrationConnection).mockResolvedValue(
      connection({ status: "DISABLED" }),
    );

    renderWithQuery(<IntegrationsClient slug="launchpad" />);

    await screen.findByText("#C0123456789");
    await userEvent.click(screen.getByRole("button", { name: /^disable$/i }));

    // Confirm in the dialog.
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^disable$/i }),
    );

    await waitFor(() => {
      expect(disableIntegrationConnection).toHaveBeenCalledWith(
        "session-token",
        "launchpad",
        "conn_1",
      );
    });
  });
});
