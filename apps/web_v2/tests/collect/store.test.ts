import { beforeEach, describe, expect, it } from "vitest";
import {
  isDirty,
  useCollectStore,
} from "@/lib/collect/form-config-store";
import { makeProject } from "../helpers/fixtures";

beforeEach(() => {
  useCollectStore.getState().discardAll();
});

describe("form-config-store — ensure", () => {
  it("seeds a draft/saved snapshot for a new slug", () => {
    const project = makeProject({ slug: "alpha" });
    useCollectStore.getState().ensure("alpha", project);

    const snap = useCollectStore.getState().bySlug["alpha"];
    expect(snap).toBeDefined();
    expect(snap!.draft.branding.colors.primary).toBe("#6366f1");
    expect(isDirty(snap)).toBe(false);
  });

  it("does not overwrite existing snapshots", () => {
    const project = makeProject({ slug: "alpha" });
    useCollectStore.getState().ensure("alpha", project);
    useCollectStore.getState().update("alpha", {
      content: { headerTitle: "Custom title" },
    });

    const before = useCollectStore.getState().bySlug["alpha"]!.draft.content
      .headerTitle;
    useCollectStore.getState().ensure("alpha", project);
    const after = useCollectStore.getState().bySlug["alpha"]!.draft.content
      .headerTitle;
    expect(after).toBe(before);
  });
});

describe("form-config-store — update / save / reset", () => {
  it("marks snapshot dirty after update", () => {
    const project = makeProject({ slug: "alpha" });
    useCollectStore.getState().ensure("alpha", project);

    useCollectStore.getState().update("alpha", {
      branding: { colors: { primary: "#ff0000" } },
    });
    const snap = useCollectStore.getState().bySlug["alpha"];
    expect(snap!.draft.branding.colors.primary).toBe("#ff0000");
    expect(isDirty(snap)).toBe(true);
  });

  it("save commits draft → saved and clears dirty", () => {
    const project = makeProject({ slug: "alpha" });
    useCollectStore.getState().ensure("alpha", project);
    useCollectStore.getState().update("alpha", {
      content: { submitButtonLabel: "Send it" },
    });

    useCollectStore.getState().save("alpha");
    const snap = useCollectStore.getState().bySlug["alpha"];
    expect(snap!.saved.content.submitButtonLabel).toBe("Send it");
    expect(isDirty(snap)).toBe(false);
  });

  it("reset reverts draft to the last saved snapshot", () => {
    const project = makeProject({ slug: "alpha" });
    useCollectStore.getState().ensure("alpha", project);
    useCollectStore.getState().save("alpha");
    useCollectStore.getState().update("alpha", {
      content: { headerTitle: "Temporary" },
    });
    expect(isDirty(useCollectStore.getState().bySlug["alpha"])).toBe(true);

    useCollectStore.getState().reset("alpha");
    const snap = useCollectStore.getState().bySlug["alpha"];
    expect(snap!.draft.content.headerTitle).not.toBe("Temporary");
    expect(isDirty(snap)).toBe(false);
  });

  it("keeps per-slug drafts isolated", () => {
    const a = makeProject({ slug: "alpha", brandColorPrimary: "#111111" });
    const b = makeProject({ slug: "beta", brandColorPrimary: "#ffffff" });

    useCollectStore.getState().ensure("alpha", a);
    useCollectStore.getState().ensure("beta", b);

    useCollectStore.getState().update("alpha", {
      content: { headerTitle: "Alpha header" },
    });

    const alpha = useCollectStore.getState().bySlug["alpha"]!;
    const beta = useCollectStore.getState().bySlug["beta"]!;
    expect(alpha.draft.content.headerTitle).toBe("Alpha header");
    expect(beta.draft.content.headerTitle).not.toBe("Alpha header");
    expect(beta.draft.branding.colors.primary).toBe("#ffffff");
  });

  it("update is a no-op when patch produces an identical draft", () => {
    const project = makeProject({ slug: "alpha" });
    useCollectStore.getState().ensure("alpha", project);
    const before = useCollectStore.getState().bySlug["alpha"];

    useCollectStore.getState().update("alpha", {
      branding: { colors: { primary: before!.draft.branding.colors.primary } },
    });
    const after = useCollectStore.getState().bySlug["alpha"];
    expect(after).toBe(before);
  });
});
