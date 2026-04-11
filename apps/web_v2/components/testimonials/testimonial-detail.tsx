"use client";

import * as React from "react";
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  StarIcon,
  EyeIcon,
  EyeOffIcon,
  XIcon,
  MailIcon,
  CalendarIcon,
  GlobeIcon,
  TagIcon,
  ShieldAlertIcon,
  ArrowLeftIcon,
  MessageSquareTextIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  type MockTestimonial,
  type ModerationStatus,
  timeAgo,
} from "@/lib/mock-data";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ModerationStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    pill: string;
  }
> = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2Icon,
    pill: "text-success bg-success/10",
  },
  PENDING: {
    label: "Pending",
    icon: ClockIcon,
    pill: "text-muted-foreground bg-muted",
  },
  FLAGGED: {
    label: "Flagged",
    icon: AlertTriangleIcon,
    pill: "text-warning bg-warning/12",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircleIcon,
    pill: "text-destructive bg-destructive/10",
  },
};

// ── Stars ─────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-3.5",
            i < rating
              ? "fill-warning text-warning"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function DetailEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
        <MessageSquareTextIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        No testimonial selected
      </p>
      <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
        Select a testimonial from the list to view its details.
      </p>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col p-5 space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full animate-shimmer" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32 animate-shimmer" />
          <Skeleton className="h-3 w-24 animate-shimmer" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full animate-shimmer" />
        <Skeleton className="h-3 w-5/6 animate-shimmer" />
        <Skeleton className="h-3 w-4/6 animate-shimmer" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-7 w-20 rounded animate-shimmer" />
        <Skeleton className="h-7 w-20 rounded animate-shimmer" />
      </div>
    </div>
  );
}

// ── Main detail component ─────────────────────────────────────────────────────

interface TestimonialDetailProps {
  testimonial: MockTestimonial | null;
  loading?: boolean;
  onClose?: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  showBack?: boolean;
  onBack?: () => void;
  variant?: "panel" | "page";
}

export function TestimonialDetail({
  testimonial,
  loading,
  onClose,
  onApprove,
  onReject,
  onTogglePublish,
  showBack,
  onBack,
  variant = "panel",
}: TestimonialDetailProps) {
  if (loading) return <DetailSkeleton />;
  if (!testimonial) return <DetailEmpty />;

  const t = testimonial;
  const cfg = STATUS_CONFIG[t.moderationStatus];
  const isActionable =
    t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED";
  const isPage = variant === "page";

  return (
    <div className={cn("flex flex-1 flex-col", isPage && "pb-8")} key={t.id}>
      {/* Header bar */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border shrink-0",
          isPage ? "px-6 py-4" : "px-5 py-3"
        )}
      >
        {showBack && (
          <button
            onClick={onBack}
            className="mr-1 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 active:scale-[0.97]"
            aria-label="Back to list"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
        )}
        <span className="flex-1 text-xs font-semibold text-foreground truncate">
          Testimonial
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 active:scale-[0.97]"
            aria-label="Close detail panel"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <ScrollArea className="flex-1">
        <div
          className={cn(
            "divide-y divide-border",
            isPage ? "px-6" : "px-5"
          )}
        >
          {/* ── Author ── */}
          <div
            className="py-5 detail-section-enter"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground select-none">
                {t.authorName[0].toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {t.authorName}
                  </span>
                  {t.isOAuthVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-success shrink-0">
                      <ShieldCheckIcon className="size-3" />
                      Verified
                    </span>
                  )}
                </div>
                {(t.authorRole || t.authorCompany) && (
                  <p className="text-xs text-muted-foreground">
                    {[t.authorRole, t.authorCompany]
                      .filter(Boolean)
                      .join(" at ")}
                  </p>
                )}
                {t.authorEmail && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MailIcon className="size-3 shrink-0" />
                    {t.authorEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div
            className="py-5 detail-section-enter"
            style={{ animationDelay: "40ms" }}
          >
            {t.rating != null && (
              <div className="mb-3">
                <Stars rating={t.rating} />
              </div>
            )}
            <p className="text-sm leading-relaxed text-foreground">
              {t.content}
            </p>
          </div>

          {/* ── Status + metadata ── */}
          <div
            className="py-5 space-y-3 detail-section-enter"
            style={{ animationDelay: "80ms" }}
          >
            {/* Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  cfg.pill
                )}
              >
                <cfg.icon className="size-3.5 shrink-0" />
                {cfg.label}
              </span>

              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                  t.isPublished
                    ? "text-success bg-success/10"
                    : "text-muted-foreground bg-muted"
                )}
              >
                {t.isPublished ? (
                  <EyeIcon className="size-3" />
                ) : (
                  <EyeOffIcon className="size-3" />
                )}
                {t.isPublished ? "Published" : "Unpublished"}
              </span>
            </div>

            {/* Tags */}
            {t.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <TagIcon className="size-3 text-muted-foreground shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {t.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded bg-brand-muted px-1.5 py-0.5 text-[10px] font-medium text-brand"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Moderation flags */}
            {t.moderationFlags && t.moderationFlags.length > 0 && (
              <div className="rounded-lg bg-destructive/5 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShieldAlertIcon className="size-3.5 text-destructive" />
                  <span className="text-[11px] font-semibold text-destructive">
                    Moderation flags
                  </span>
                  {t.moderationScore != null && (
                    <span className="ml-auto text-[10px] tabular-nums text-destructive/70">
                      Score: {(t.moderationScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.moderationFlags.map((flag) => (
                    <span
                      key={flag}
                      className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
                    >
                      {flag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3" />
                {t.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {t.source && (
                <span className="flex items-center gap-1">
                  <GlobeIcon className="size-3" />
                  {t.source}
                </span>
              )}
              <span className="tabular-nums">{timeAgo(t.createdAt)}</span>
            </div>
          </div>

          {/* ── Actions ── */}
          {isActionable && (onApprove || onReject || onTogglePublish) && (
            <div
              className="py-5 space-y-3 detail-section-enter"
              style={{ animationDelay: "120ms" }}
            >
              <p className="label-quiet">Actions</p>
              <div className="flex flex-wrap items-center gap-2">
                {onApprove && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-success hover:bg-success/10 hover:text-success hover:border-success/30 active:scale-[0.97]"
                    onClick={() => onApprove(t.id)}
                  >
                    <CheckCircle2Icon className="size-3.5" />
                    Approve
                  </Button>
                )}
                {onReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 active:scale-[0.97]"
                    onClick={() => onReject(t.id)}
                  >
                    <XCircleIcon className="size-3.5" />
                    Reject
                  </Button>
                )}
                {onTogglePublish && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-muted-foreground hover:text-foreground active:scale-[0.97]"
                    onClick={() => onTogglePublish(t.id, !t.isPublished)}
                  >
                    {t.isPublished ? (
                      <>
                        <EyeOffIcon className="size-3.5" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <EyeIcon className="size-3.5" />
                        Publish
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
