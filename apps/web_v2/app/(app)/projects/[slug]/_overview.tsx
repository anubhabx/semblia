"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  StarIcon,
  RadioIcon,
  PuzzleIcon,
  CheckIcon,
  XIcon,
  MessageSquareTextIcon,
  BarChart3Icon,
  ZapIcon,
  CopyIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/ui/copy-button";
import {
  apiGetTestimonials,
  apiGetWidgets,
  apiApproveTestimonial,
  apiRejectTestimonial
} from "@/lib/api";
import {
  getProjectBySlug,
  timeAgo,
  type MockProject,
  type MockTestimonial,
  type MockWidget,
  type ModerationStatus
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ── Moderation status config ────────────────────────────────────────────────

const statusConfig: Record<
  ModerationStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2Icon,
    className: "text-success bg-success/10"
  },
  PENDING: {
    label: "Pending",
    icon: ClockIcon,
    className: "text-muted-foreground bg-muted"
  },
  FLAGGED: {
    label: "Flagged",
    icon: AlertTriangleIcon,
    className: "text-warning bg-warning/12"
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircleIcon,
    className: "text-destructive bg-destructive/10"
  }
};

function StatusPill({ status }: { status: ModerationStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        cfg.className
      )}
    >
      <cfg.icon className="size-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

// ── Stars ───────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-2.5",
            i < rating ? "fill-warning text-warning" : "fill-border text-border"
          )}
        />
      ))}
    </span>
  );
}

// ── Number formatting ───────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ── Metric tile ─────────────────────────────────────────────────────────────

function MetricTile({
  label,
  value,
  sub,
  accent,
  progress,
  index
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "warning" | "success" | "brand" | "default";
  progress?: number;
  index: number;
}) {
  const tone = accent ?? "default";
  return (
    <div
      className={cn(
        "relative flex flex-col gap-1 rounded-xl px-5 py-4 ring-1 ring-foreground/[0.06] animate-fade-up",
        tone === "warning" && "bg-warning/[0.03]",
        tone === "success" && "bg-success/[0.03]",
        tone === "default" && "bg-card"
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <span className="label-quiet">{label}</span>
      <span
        className={cn(
          "text-2xl font-bold tracking-tight tabular-nums",
          tone === "warning" && "text-warning",
          tone === "success" && "text-success",
          (tone === "default" || tone === "brand") && "text-foreground"
        )}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
      {progress !== undefined && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              tone === "warning" ? "bg-warning" : "bg-success"
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Testimonial feed row ────────────────────────────────────────────────────

function FeedRow({
  t,
  slug,
  index
}: {
  t: MockTestimonial;
  slug: string;
  index: number;
}) {
  return (
    <Link
      href={`/projects/${slug}/testimonials/${t.id}`}
      className="group tactile flex gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-muted/40 animate-fade-up"
      style={{
        animationDelay: `${100 + index * 50}ms`,
        animationFillMode: "both"
      }}
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
        {t.authorName[0].toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-foreground">
            {t.authorName}
          </span>
          {t.authorRole && (
            <span className="text-[11px] text-muted-foreground">
              {t.authorRole}
              {t.authorCompany && ` at ${t.authorCompany}`}
            </span>
          )}
          {t.isOAuthVerified && (
            <ShieldCheckIcon className="size-3 shrink-0 text-success" />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {t.content}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <Stars rating={t.rating} />
          <StatusPill status={t.moderationStatus} />
          {t.isPublished ? (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <EyeIcon className="size-3" />
              Published
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <EyeOffIcon className="size-3" />
              Draft
            </span>
          )}
          <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
            {timeAgo(t.createdAt)}
          </span>
        </div>
      </div>

      <ArrowRightIcon className="mt-1 size-3.5 shrink-0 text-muted-foreground/20 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
    </Link>
  );
}

// ── Moderation queue item (with inline actions) ─────────────────────────────

function ModerationItem({
  t,
  slug,
  index,
  onApprove,
  onReject,
  resolving
}: {
  t: MockTestimonial;
  slug: string;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  resolving: Set<string>;
}) {
  const isResolving = resolving.has(t.id);

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-all duration-200 animate-fade-up",
        isResolving && "opacity-40 pointer-events-none"
      )}
      style={{
        animationDelay: `${80 + index * 60}ms`,
        animationFillMode: "both"
      }}
    >
      <Link
        href={`/projects/${slug}/testimonials/${t.id}`}
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted/80"
      >
        {t.authorName[0].toUpperCase()}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/projects/${slug}/testimonials/${t.id}`}
          className="group block"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium truncate">{t.authorName}</span>
            <StatusPill status={t.moderationStatus} />
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">
            {t.content}
          </p>
        </Link>

        {t.moderationFlags && t.moderationFlags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {t.moderationFlags.map((flag) => (
              <span
                key={flag}
                className="rounded bg-warning/10 px-1.5 py-0.5 text-[9px] font-medium text-warning"
              >
                {flag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={() => onApprove(t.id)}
            disabled={isResolving}
            className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[10px] font-semibold text-success transition-all duration-150 hover:bg-success/20 active:scale-[0.97]"
          >
            <CheckIcon className="size-3" />
            Approve
          </button>
          <button
            onClick={() => onReject(t.id)}
            disabled={isResolving}
            className="inline-flex items-center gap-1 rounded-md bg-destructive/8 px-2 py-1 text-[10px] font-semibold text-destructive transition-all duration-150 hover:bg-destructive/15 active:scale-[0.97]"
          >
            <XIcon className="size-3" />
            Reject
          </button>
          <span className="ml-auto text-[9px] tabular-nums text-muted-foreground">
            {timeAgo(t.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Widget mini-card ────────────────────────────────────────────────────────

const LAYOUT_LABELS: Record<string, string> = {
  carousel: "Carousel",
  grid: "Grid",
  masonry: "Masonry",
  wall: "Wall",
  list: "List"
};

function WidgetMiniCard({
  widget,
  slug,
  index
}: {
  widget: MockWidget;
  slug: string;
  index: number;
}) {
  return (
    <Link
      href={`/projects/${slug}/widgets/${widget.id}`}
      className="group tactile flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-muted/40 animate-fade-up"
      style={{
        animationDelay: `${120 + index * 60}ms`,
        animationFillMode: "both"
      }}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <PuzzleIcon className="size-3.5 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium text-foreground">
          {LAYOUT_LABELS[widget.config.layoutType] ?? widget.config.layoutType}
        </span>
        <div className="mt-0.5 flex items-center gap-3 text-[10px] tabular-nums text-muted-foreground">
          <span>{fmtNum(widget._analytics.totalLoads)} loads</span>
          <span>{widget._analytics.avgLoadMs}ms avg</span>
        </div>
      </div>
      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
        {widget.config.theme}
      </Badge>
      <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground/20 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
    </Link>
  );
}

// ── Rating distribution ─────────────────────────────────────────────────────

function RatingDistribution({
  testimonials
}: {
  testimonials: MockTestimonial[];
}) {
  const rated = testimonials.filter((t) => t.rating != null);
  if (rated.length === 0) return null;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: rated.filter((t) => t.rating === star).length
  }));
  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div>
      <span className="label-quiet">Rating breakdown</span>
      <div className="mt-2 space-y-1">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
              {star}
            </span>
            <StarIcon className="size-2.5 shrink-0 fill-warning text-warning" />
            <div className="flex-1 overflow-hidden rounded-full bg-muted h-1.5">
              <div
                className="h-full rounded-full bg-warning/60 transition-all duration-500"
                style={{
                  width: count > 0 ? `${(count / maxCount) * 100}%` : "0%"
                }}
              />
            </div>
            <span className="w-4 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton loading state ──────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 px-6 pt-6 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl px-5 py-4 ring-1 ring-foreground/[0.06]"
          >
            <Skeleton className="h-2.5 w-16 animate-shimmer" />
            <Skeleton className="h-7 w-12 animate-shimmer" />
            <Skeleton className="h-2.5 w-24 animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Body skeleton */}
      <div className="mt-6 grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="border-t border-border">
          <div className="px-5 pt-5 pb-3">
            <Skeleton className="h-3 w-28 animate-shimmer" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 px-5 py-3.5">
              <Skeleton className="size-7 shrink-0 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32 animate-shimmer" />
                <Skeleton className="h-3 w-full max-w-[280px] animate-shimmer" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-14 animate-shimmer" />
                  <Skeleton className="h-3 w-12 animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="border-t border-border lg:border-l lg:border-t-0">
          <div className="px-5 pt-5 pb-3">
            <Skeleton className="h-3 w-24 animate-shimmer" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-2.5 px-5 py-2.5">
              <Skeleton className="size-6 shrink-0 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24 animate-shimmer" />
                <Skeleton className="h-2.5 w-full animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty feed state ────────────────────────────────────────────────────────

function EmptyFeed({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center py-14 px-6 text-center animate-fade-up">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
        <MessageSquareTextIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">No testimonials yet</p>
      <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
        Share your collection link to start gathering testimonials from your
        users.
      </p>
      <Button size="sm" variant="outline" className="mt-4 gap-1.5" asChild>
        <Link href={`/projects/${slug}/collect`}>
          <RadioIcon className="size-3.5" />
          Get collection link
        </Link>
      </Button>
    </div>
  );
}

// ── All-clear moderation state ──────────────────────────────────────────────

function AllClear() {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-success/[0.04] px-3 py-3 animate-fade-up">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2Icon className="size-3.5 text-success" />
      </span>
      <div>
        <p className="text-xs font-medium text-foreground">All clear</p>
        <p className="text-[10px] text-muted-foreground">
          No testimonials need moderation right now.
        </p>
      </div>
    </div>
  );
}

// ── Main overview component ─────────────────────────────────────────────────

export function OverviewHub({ slug }: { slug: string }) {
  const project = getProjectBySlug(slug);
  const [testimonials, setTestimonials] = React.useState<MockTestimonial[]>([]);
  const [widgets, setWidgets] = React.useState<MockWidget[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [resolving, setResolving] = React.useState<Set<string>>(new Set());

  // Fetch data
  React.useEffect(() => {
    if (!project) return;
    setLoading(true);
    Promise.all([
      apiGetTestimonials(project.id, { pageSize: 50 }),
      apiGetWidgets(project.id)
    ]).then(([testimonialsRes, widgetsRes]) => {
      setTestimonials(testimonialsRes.items);
      setWidgets(widgetsRes);
      setLoading(false);
    });
  }, [project]);

  if (!project) return null;
  if (loading) return <OverviewSkeleton />;

  // ── Derived metrics ────────────────────────────────────────────────
  const total = testimonials.length;
  const published = testimonials.filter((t) => t.isPublished).length;
  const publishedPct = total > 0 ? Math.round((published / total) * 100) : 0;

  const pending = testimonials.filter(
    (t) => t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED"
  );

  const rated = testimonials.filter((t) => t.rating != null);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length).toFixed(
          1
        )
      : null;

  const totalWidgetLoads = widgets.reduce(
    (s, w) => s + w._analytics.totalLoads,
    0
  );

  // Recent 8 testimonials
  const recent = [...testimonials]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const collectionUrl =
    project.collectionFormUrl ?? `https://tresta.io/t/${project.slug}`;

  // ── Moderation handlers (optimistic) ────────────────────────────────
  function handleApprove(id: string) {
    setResolving((prev) => new Set(prev).add(id));
    apiApproveTestimonial(id).then(() => {
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                moderationStatus: "APPROVED" as ModerationStatus,
                isApproved: true
              }
            : t
        )
      );
      setResolving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }

  function handleReject(id: string) {
    setResolving((prev) => new Set(prev).add(id));
    apiRejectTestimonial(id).then(() => {
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, moderationStatus: "REJECTED" as ModerationStatus }
            : t
        )
      );
      setResolving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Stats grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 px-6 pt-6 pb-2 lg:grid-cols-4">
        <MetricTile
          label="Total"
          value={total}
          sub={`${testimonials.filter((t) => t.isApproved).length} approved`}
          index={0}
        />
        <MetricTile
          label="Published"
          value={published}
          sub={`${publishedPct}% of total`}
          accent={publishedPct >= 50 ? "success" : "default"}
          progress={publishedPct}
          index={1}
        />
        <MetricTile
          label="Pending review"
          value={pending.length}
          sub={pending.length > 0 ? "need attention" : "all clear"}
          accent={pending.length > 0 ? "warning" : "default"}
          index={2}
        />
        <MetricTile
          label="Avg rating"
          value={avgRating ? `${avgRating}` : "--"}
          sub={
            rated.length > 0 ? `from ${rated.length} ratings` : "no ratings yet"
          }
          index={3}
        />
      </div>

      {/* ── Widget performance strip ────────────────────────────────── */}
      {totalWidgetLoads > 0 && (
        <div
          className="mx-6 mt-3 flex items-center gap-4 rounded-lg bg-muted/40 px-4 py-2.5 animate-fade-up"
          style={{ animationDelay: "240ms", animationFillMode: "both" }}
        >
          <BarChart3Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {fmtNum(totalWidgetLoads)}
            </span>{" "}
            widget loads across{" "}
            <span className="font-medium text-foreground">
              {widgets.length}
            </span>{" "}
            widget{widgets.length !== 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto gap-1 text-[10px]"
            asChild
          >
            <Link href={`/projects/${slug}/analytics`}>
              View analytics
              <ArrowRightIcon className="size-3" />
            </Link>
          </Button>
        </div>
      )}

      {/* ── Main body — asymmetric two-column ───────────────────────── */}
      <div className="mt-4 grid flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* ─── Left column: Recent feed ─────────────────────────────── */}
        <section className="min-w-0 border-t border-border">
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                Recent
              </span>
              {recent.length > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {recent.length}
                </span>
              )}
            </div>
            <Button variant="ghost" size="xs" asChild>
              <Link
                href={`/projects/${slug}/testimonials`}
                className="gap-1 text-[10px]"
              >
                View all
                <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </div>

          {recent.length === 0 ? (
            <EmptyFeed slug={slug} />
          ) : (
            <div className="divide-y divide-border/60">
              {recent.map((t, i) => (
                <FeedRow key={t.id} t={t} slug={slug} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ─── Right column: Actionable panels ──────────────────────── */}
        <aside className="border-t border-border lg:border-l lg:border-t-0">
          {/* ── Moderation queue ───────────────────────────────────── */}
          <div className="border-b border-border/60 px-4 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <span className="label-quiet">Needs attention</span>
              {pending.length > 0 && (
                <span className="rounded-full bg-warning/12 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-warning">
                  {pending.length}
                </span>
              )}
            </div>

            <div className="mt-3 space-y-1">
              {pending.length === 0 ? (
                <AllClear />
              ) : (
                pending.map((t, i) => (
                  <ModerationItem
                    key={t.id}
                    t={t}
                    slug={slug}
                    index={i}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    resolving={resolving}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Widget snapshot ─────────────────────────────────────── */}
          <div className="border-b border-border/60 px-4 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <span className="label-quiet">Widgets</span>
              <Button variant="ghost" size="xs" asChild>
                <Link
                  href={`/projects/${slug}/widgets`}
                  className="gap-1 text-[10px]"
                >
                  Manage
                  <ArrowRightIcon className="size-3" />
                </Link>
              </Button>
            </div>

            {widgets.length === 0 ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-3 animate-fade-up">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <PuzzleIcon className="size-3.5 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-xs font-medium">No widgets</p>
                  <p className="text-[10px] text-muted-foreground">
                    Create one to embed testimonials.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-0.5">
                {widgets.map((w, i) => (
                  <WidgetMiniCard key={w.id} widget={w} slug={slug} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* ── Rating distribution ─────────────────────────────────── */}
          <div className="border-b border-border/60 px-4 pt-5 pb-4">
            {rated.length > 0 ? (
              <RatingDistribution testimonials={testimonials} />
            ) : (
              <>
                <span className="label-quiet">Rating breakdown</span>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  No rated testimonials yet.
                </p>
              </>
            )}
          </div>

          {/* ── Collection link ─────────────────────────────────────── */}
          <div className="px-4 pt-5 pb-5">
            <span className="label-quiet">Collection link</span>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-2">
              <span className="flex-1 truncate font-mono text-[10px] text-muted-foreground">
                {collectionUrl}
              </span>
              <CopyButton value={collectionUrl} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="xs"
                className="flex-1 gap-1 text-[10px]"
                asChild
              >
                <Link href={`/projects/${slug}/collect`}>
                  <RadioIcon className="size-3" />
                  Configure form
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="flex-1 gap-1 text-[10px]"
                asChild
              >
                <Link href={`/projects/${slug}/api-keys`}>
                  <ZapIcon className="size-3" />
                  API keys
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
