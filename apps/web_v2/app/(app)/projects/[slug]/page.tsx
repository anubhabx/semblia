import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ExternalLinkIcon,
  RadioIcon,
  StarIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  MessageSquareTextIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  getProjectBySlug,
  getTestimonialsByProject,
  PROJECT_TYPE_LABELS,
  timeAgo,
  type ModerationStatus,
  type MockTestimonial,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project?.name ?? "Project" };
}

// ── Moderation status badge ────────────────────────────────────────────────────

const statusConfig: Record<
  ModerationStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2Icon,
    className: "text-success bg-success/10",
  },
  PENDING: {
    label: "Pending",
    icon: ClockIcon,
    className: "text-muted-foreground bg-muted",
  },
  FLAGGED: {
    label: "Flagged",
    icon: AlertTriangleIcon,
    className: "text-warning bg-warning/12",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircleIcon,
    className: "text-destructive bg-destructive/10",
  },
};

function StatusPill({ status }: { status: ModerationStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}
    >
      <cfg.icon className="size-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

// ── Rating stars ───────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`size-2.5 ${
            i < rating
              ? "fill-warning text-warning"
              : "fill-border text-border"
          }`}
        />
      ))}
    </span>
  );
}

// ── Testimonial feed item ──────────────────────────────────────────────────────

function TestimonialFeedItem({
  t,
  projectSlug,
}: {
  t: MockTestimonial;
  projectSlug: string;
}) {
  return (
    <Link
      href={`/projects/${projectSlug}/testimonials/${t.id}`}
      className="group flex gap-3 px-6 py-4 transition-colors hover:bg-muted/40"
    >
      {/* Author avatar */}
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
        {t.authorName[0].toUpperCase()}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {t.authorName}
          </span>
          {t.authorRole && (
            <span className="text-xs text-muted-foreground">
              {t.authorRole}
              {t.authorCompany && `, ${t.authorCompany}`}
            </span>
          )}
          {t.isOAuthVerified && (
            <span
              className="inline-flex items-center"
              aria-label={`Verified via ${t.oauthProvider}`}
            >
              <ShieldCheckIcon className="size-3 shrink-0 text-success" />
            </span>
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {t.content}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
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
              Unpublished
            </span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
            {timeAgo(t.createdAt)}
          </span>
        </div>
      </div>

      <ArrowRightIcon className="mt-1 size-3.5 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
    </Link>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  urgent,
  progress,
}: {
  label: string;
  value: number | string;
  sub?: string;
  urgent?: boolean;
  progress?: number;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-0.5 py-3.5 px-5 min-w-[80px]",
      urgent && "bg-warning/5"
    )}>
      <span className="label-quiet">{label}</span>
      <span className={cn(
        "text-xl font-bold tracking-tight tabular-nums",
        urgent ? "text-warning" : "text-foreground"
      )}>
        {value}
      </span>
      {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
      {progress !== undefined && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", urgent ? "bg-warning" : "bg-success")}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Rating distribution ──────────────────────────────────────────────────────

function RatingDistribution({ testimonials }: { testimonials: MockTestimonial[] }) {
  const rated = testimonials.filter((t) => t.rating != null);
  if (rated.length === 0) return null;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: rated.filter((t) => t.rating === star).length,
  }));
  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="mt-4">
      <span className="label-quiet">Rating breakdown</span>
      <div className="mt-2 space-y-1">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
              {star}
            </span>
            <StarIcon className="size-2.5 shrink-0 fill-warning text-warning" />
            <div className="flex-1 overflow-hidden rounded-full bg-muted h-1.5">
              <div
                className="h-full rounded-full bg-warning/60 transition-all"
                style={{ width: count > 0 ? `${(count / maxCount) * 100}%` : "0%" }}
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ProjectHubPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const testimonials = getTestimonialsByProject(project.id);
  const published = testimonials.filter((t) => t.isPublished).length;
  const pending = testimonials.filter(
    (t) => t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED"
  ).length;
  const publishedPct = testimonials.length > 0
    ? Math.round((published / testimonials.length) * 100)
    : 0;
  const ratedTestimonials = testimonials.filter((t) => t.rating != null);
  const avgRating =
    ratedTestimonials.length > 0
      ? (
          ratedTestimonials.reduce((s, t) => s + (t.rating ?? 0), 0) /
          ratedTestimonials.length
        ).toFixed(1)
      : null;

  const typeLabel = project.projectType
    ? PROJECT_TYPE_LABELS[project.projectType]
    : null;

  // Recent 5 testimonials, newest first
  const recentTestimonials = [...testimonials]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  // Pending moderation (needs attention)
  const pendingTestimonials = testimonials.filter(
    (t) => t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED"
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Project page header (identity is in the topbar) ── */}
      <header className="sticky top-14 z-20 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="flex flex-col gap-5 px-6 pt-7 pb-6 lg:flex-row lg:items-end lg:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {project.name}
              </h1>
              {typeLabel && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium px-1.5 py-0"
                >
                  {typeLabel}
                </Badge>
              )}
              {!project.isActive && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Inactive
                </Badge>
              )}
            </div>
            {project.shortDescription && (
              <p className="mt-1.5 max-w-[60ch] text-xs text-muted-foreground">
                {project.shortDescription}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {project.websiteUrl && (
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open website"
                >
                  <ExternalLinkIcon className="size-3.5" />
                  Website
                </a>
              </Button>
            )}
            <Button size="sm" className="gap-1.5" asChild>
              <Link href={`/projects/${slug}/collect`}>
                <RadioIcon className="size-3.5" />
                Share form
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex divide-x divide-border border-t border-border overflow-x-auto">
          <StatTile label="Total" value={testimonials.length} />
          <StatTile
            label="Published"
            value={published}
            sub={`${publishedPct}% of total`}
            progress={publishedPct}
          />
          <StatTile
            label="Pending"
            value={pending}
            sub={pending > 0 ? "need attention" : "all clear"}
            urgent={pending > 0}
          />
          {avgRating && (
            <StatTile
              label="Avg rating"
              value={`${avgRating} ★`}
              sub="out of 5"
            />
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex flex-1 flex-col gap-0 lg:flex-row">
        {/* ── Left: testimonial feed ── */}
        <section className="flex-1 min-w-0">
          {/* Section header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Recent testimonials</span>
              {recentTestimonials.length > 0 && (
                <span className="tabular-nums text-xs text-muted-foreground">{recentTestimonials.length}</span>
              )}
            </div>
            <Button variant="ghost" size="xs" asChild>
              <Link
                href={`/projects/${slug}/testimonials`}
                className="gap-1 text-xs"
              >
                View all
                <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </div>

          {recentTestimonials.length === 0 ? (
            <div className="flex flex-col items-center py-16 px-6 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
                <MessageSquareTextIcon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No testimonials yet</p>
              <p className="mt-1 max-w-[240px] text-xs text-muted-foreground leading-relaxed">
                Share your collection link to start gathering testimonials.
              </p>
              <Button size="sm" variant="outline" className="mt-4 gap-1.5" asChild>
                <Link href={`/projects/${slug}/collect`}>
                  <RadioIcon className="size-3.5" />
                  Get collection link
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTestimonials.map((t) => (
                <TestimonialFeedItem key={t.id} t={t} projectSlug={slug} />
              ))}
            </div>
          )}
        </section>

        {/* ── Right: actions + moderation queue ── */}
        <aside className="w-full shrink-0 border-t border-border lg:w-72 lg:border-l lg:border-t-0">
          {/* Moderation queue */}
          {pendingTestimonials.length > 0 && (
            <div className="border-b border-border px-5 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <span className="label-quiet">Needs attention</span>
                <span className="rounded-full bg-warning/12 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-warning">
                  {pendingTestimonials.length}
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {pendingTestimonials.map((t) => (
                  <ModerationQueueItem key={t.id} t={t} projectSlug={slug} />
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="px-5 pt-5 pb-5">
            <span className="label-quiet">Quick actions</span>
            <div className="mt-2.5 space-y-1">
              <QuickActionRow
                icon={RadioIcon}
                label="Share collection link"
                sub="Get new testimonials"
                href={`/projects/${slug}/collect`}
              />
              <QuickActionRow
                icon={MessageSquareTextIcon}
                label="All testimonials"
                sub={`${testimonials.length} total · ${published} published`}
                href={`/projects/${slug}/testimonials`}
              />
            </div>

            {/* Rating breakdown */}
            <RatingDistribution testimonials={testimonials} />

            {/* Collection URL box */}
            <div className="mt-4">
              <span className="label-quiet">Collection link</span>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-2.5 py-2">
                <span className="flex-1 truncate font-mono text-[10px] text-muted-foreground">
                  {project.collectionFormUrl ?? `https://tresta.io/t/${project.slug}`}
                </span>
                <CopyButton
                  value={
                    project.collectionFormUrl ??
                    `https://tresta.io/t/${project.slug}`
                  }
                />
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

// ── Moderation queue mini-item ─────────────────────────────────────────────────

function ModerationQueueItem({
  t,
  projectSlug,
}: {
  t: MockTestimonial;
  projectSlug: string;
}) {
  return (
    <Link
      href={`/projects/${projectSlug}/testimonials/${t.id}`}
      className="flex items-start gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60"
    >
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
        {t.authorName[0]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{t.authorName}</p>
        <p className="text-[10px] text-muted-foreground line-clamp-1">
          {t.content}
        </p>
      </div>
      <StatusPill status={t.moderationStatus} />
    </Link>
  );
}

// ── Quick action row ───────────────────────────────────────────────────────────

function QuickActionRow({
  icon: Icon,
  label,
  sub,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
      </div>
      <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
    </Link>
  );
}

