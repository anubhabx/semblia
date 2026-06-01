"use client";

import * as React from "react";
import type { V2MediaAssetDTO } from "@workspace/types";
import { useStudioDraft } from "@/lib/collect/studio-draft-context";
import { MediaUploader } from "@/components/media/media-uploader";
import { SectionCollapsible, StudioToggle } from "./studio-primitives";

/* ─── Logo section — upload + where the mark appears ─────────────────────── */

export function LogoSection() {
  const { slug, formId, draft, setLogo, setLayout, setLoader, setSuccess } =
    useStudioDraft();

  // The draft persists only id + url; rebuild a minimal asset for the uploader
  // to display the current logo without re-fetching the full record.
  const value: V2MediaAssetDTO | null = React.useMemo(() => {
    if (!draft.logoAssetId) return null;
    return {
      id: draft.logoAssetId,
      url: draft.logoUrl,
      contentType: "image/*",
      byteSize: null,
      purpose: "FORM_BRANDING_LOGO",
      visibility: "PUBLIC",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
  }, [draft.logoAssetId, draft.logoUrl]);

  return (
    <SectionCollapsible title="Logo">
      <div className="mb-3.5">
        <MediaUploader
          purpose="FORM_BRANDING_LOGO"
          projectSlug={slug}
          formId={formId}
          value={value}
          onChange={setLogo}
          fit="contain"
          size="sm"
          helper="SVG or PNG with transparency reads best. Shown in the brand row."
        />
      </div>
      <StudioToggle
        label="Show brand pill"
        hint="The small uppercase brand label above the headline."
        checked={draft.layout.showBrandPill}
        onChange={(v) => setLayout({ showBrandPill: v })}
      />
      <StudioToggle
        label="Use logo on the loading screen"
        checked={draft.loader.useLogo}
        onChange={(v) => setLoader({ useLogo: v })}
      />
      <StudioToggle
        label="Use logo on the success screen"
        checked={draft.success.useLogo}
        onChange={(v) => setSuccess({ useLogo: v })}
      />
    </SectionCollapsible>
  );
}
