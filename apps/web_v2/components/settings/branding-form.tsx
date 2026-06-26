"use client";

import * as React from "react";
import { toast } from "sonner";
import type { V2ProjectDTO } from "@workspace/types";
import { GlobeIcon } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { ColorPicker, isValidHexColor } from "@/components/ui/color-picker";
import { PageBody, SettingsSection, SettingsFooter } from "@/components/shared";
import { useUpdateProject } from "@/hooks/api";
import { projectInitials } from "@/lib/format";
import { MediaUploader } from "@/components/media/media-uploader";
import { normalizeProject } from "./shared/normalize";

export function BrandingForm({ project }: { project: V2ProjectDTO }) {
  const norm = React.useMemo(() => normalizeProject(project), [project]);

  const [logo, setLogo] = React.useState(project.logo);
  const [brandColorPrimary, setBrandColorPrimary] = React.useState(
    norm.brandColorPrimary,
  );
  const [brandColorSecondary, setBrandColorSecondary] = React.useState(
    norm.brandColorSecondary,
  );

  const updateProject = useUpdateProject(project.slug);
  const [saving, setSaving] = React.useState(false);

  const dirty =
    (logo?.id ?? null) !== (project.logo?.id ?? null) ||
    brandColorPrimary !== norm.brandColorPrimary ||
    brandColorSecondary !== norm.brandColorSecondary;

  const canSave =
    dirty &&
    isValidHexColor(brandColorPrimary) &&
    isValidHexColor(brandColorSecondary);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await updateProject.mutateAsync({
        logoAssetId: logo?.id ?? null,
        brandColorPrimary: brandColorPrimary.trim() || null,
        brandColorSecondary: brandColorSecondary.trim() || null,
      });
      toast.success("Branding saved");
    } catch {
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setLogo(project.logo);
    setBrandColorPrimary(norm.brandColorPrimary);
    setBrandColorSecondary(norm.brandColorSecondary);
  }

  const primaryPreview =
    isValidHexColor(brandColorPrimary) && brandColorPrimary.trim()
      ? brandColorPrimary.trim()
      : "var(--brand)";
  const secondaryPreview =
    isValidHexColor(brandColorSecondary) && brandColorSecondary.trim()
      ? brandColorSecondary.trim()
      : "var(--muted-foreground)";

  return (
    <>
      <PageBody padding="default" className="space-y-6 pb-8">
        <SettingsSection
          id="logo"
          title="Logo"
          description="Shown in the sidebar, on your public collection page, and in embedded widgets. Square images render best."
        >
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_15rem] sm:items-start">
            <div className="space-y-2">
              <MediaUploader
                purpose="PROJECT_LOGO"
                projectSlug={project.slug}
                value={logo}
                onChange={setLogo}
              />
              <p className="text-[11px] text-muted-foreground">
                PNG, JPG, WebP, or GIF · up to 5 MB.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
              {logo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.url}
                  alt=""
                  className="size-10 rounded-md object-contain"
                />
              ) : (
                <span
                  className="flex size-10 items-center justify-center rounded-md text-xs font-semibold text-white"
                  style={{ backgroundColor: primaryPreview }}
                  aria-hidden
                >
                  {projectInitials(project.name)}
                </span>
              )}
              <div className="text-[11px] leading-tight">
                <p className="font-medium text-foreground">Live preview</p>
                <p className="text-muted-foreground">Sidebar avatar</p>
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          id="colors"
          title="Brand colours"
          description="Drive accents on your hosted collection page and embedded widget previews."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="b-primary">Primary</Label>
              <ColorPicker
                id="b-primary"
                label="Primary"
                value={brandColorPrimary}
                onChange={setBrandColorPrimary}
              />
              <p className="text-[11px] text-muted-foreground">
                Buttons, links, and focus rings.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-secondary">Secondary</Label>
              <ColorPicker
                id="b-secondary"
                label="Secondary"
                value={brandColorSecondary}
                onChange={setBrandColorSecondary}
              />
              <p className="text-[11px] text-muted-foreground">
                Subtle accents and dividers.
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 rounded-lg bg-muted/40 p-4"
            role="group"
            aria-label="Colour preview"
          >
            <span
              className="flex size-10 items-center justify-center rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: primaryPreview }}
              aria-hidden
            >
              {projectInitials(project.name)}
            </span>
            <div className="flex flex-1 items-center gap-2">
              <button
                type="button"
                className="rounded-md px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: primaryPreview }}
                tabIndex={-1}
              >
                Primary button
              </button>
              <span
                className="rounded-md border px-2.5 py-1 text-xs font-medium"
                style={{
                  borderColor: secondaryPreview,
                  color: secondaryPreview,
                }}
              >
                Secondary chip
              </span>
              <GlobeIcon
                className="ml-auto size-3.5 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>
        </SettingsSection>
      </PageBody>

      <SettingsFooter
        dirty={canSave}
        saving={saving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </>
  );
}
