import { type Icon as PhosphorIcon } from "@phosphor-icons/react";

/**
 * CardEmpty — the compact empty body for analytics cards.
 *
 * Dashboard cards are small and sit many-to-a-grid, so their empty state stays
 * quiet: a single muted glyph, a plain title, and one line orienting the user
 * toward the action that fills it. (The richer ghost-preview pattern lives on
 * the primary list surfaces — Responses, Developers — where there's room for
 * it.) This unifies what were a mix of bare "No X yet." lines and ad-hoc icons.
 */
export function CardEmpty({
  icon: Icon,
  title,
  hint,
}: {
  icon: PhosphorIcon;
  title: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <div className="mb-1 flex size-8 items-center justify-center rounded-full bg-muted">
        <Icon weight="regular" className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && (
        <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
