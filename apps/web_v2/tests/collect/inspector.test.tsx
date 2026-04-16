import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InspectorShell } from "@/components/collect/inspector/inspector-shell";
import { useCollectStore } from "@/lib/collect/form-config-store";
import { makeProject } from "../helpers/fixtures";

function LiveInspector({ slug }: { slug: string }) {
  const draft = useCollectStore((s) => s.bySlug[slug]?.draft);
  if (!draft) return null;
  return <InspectorShell slug={slug} config={draft} />;
}

function mount(slug: string) {
  const project = makeProject({ slug });
  useCollectStore.getState().ensure(slug, project);
  return render(<LiveInspector slug={slug} />);
}

beforeEach(() => {
  useCollectStore.getState().discardAll();
});

describe("<InspectorShell />", () => {
  it("renders all five tab triggers", () => {
    mount("alpha");
    expect(screen.getByTestId("tab-content")).toBeInTheDocument();
    expect(screen.getByTestId("tab-fields")).toBeInTheDocument();
    expect(screen.getByTestId("tab-branding")).toBeInTheDocument();
    expect(screen.getByTestId("tab-behavior")).toBeInTheDocument();
    expect(screen.getByTestId("tab-delivery")).toBeInTheDocument();
  });

  it("writes header title updates into the store", async () => {
    const user = userEvent.setup();
    mount("alpha");

    const input = screen.getByLabelText("Title") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "Hello world");

    const next = useCollectStore.getState().bySlug["alpha"]!.draft.content
      .headerTitle;
    expect(next).toBe("Hello world");
  });

  it("toggles rating field off via the Fields tab", async () => {
    const user = userEvent.setup();
    mount("alpha");

    await user.click(screen.getByTestId("tab-fields"));
    const ratingToggle = screen.getByTestId("field-rating");
    await user.click(ratingToggle);

    const snap = useCollectStore.getState().bySlug["alpha"]!;
    expect(snap.draft.fields.rating.enabled).toBe(false);
  });

  it("pins a new primary color via the branding panel", async () => {
    const user = userEvent.setup();
    mount("alpha");

    await user.click(screen.getByTestId("tab-branding"));
    const primary = screen.getByTestId("color-primary") as HTMLInputElement;
    await user.clear(primary);
    await user.type(primary, "#abcdef");

    const snap = useCollectStore.getState().bySlug["alpha"]!;
    expect(snap.draft.branding.colors.primary).toBe("#abcdef");
  });

  it("toggles OAuth providers via the Behavior tab", async () => {
    const user = userEvent.setup();
    mount("alpha");

    await user.click(screen.getByTestId("tab-behavior"));

    const githubChip = screen.getByTestId("provider-github");
    await user.click(githubChip);

    const snap = useCollectStore.getState().bySlug["alpha"]!;
    expect(snap.draft.behavior.oauthProviders).toContain("github");
  });
});
