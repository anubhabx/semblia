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
  QuoteIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Kbd } from "@/components/kbd-shortcuts-dialog";
import { cn } from "@/lib/utils";
import {
  type MockTestimonial,
  type ModerationStatus,
  timeAgo,
} from "@/lib/mock-data";

// ── Status config ─────────────────────────────────────────────────────────────────

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
    label: "Pending review",
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
    <div className="flex items-center gap-2">
      <span
        className="flex items-center gap-0.5"
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            className={cn(
              "size-4",
              i < rating
                ? "fill-warning text-warning"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </span>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {rating}.0
      </span>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function DetailEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
        <MessageSquareTextIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        No testimonial selected
      </p>
      <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
        Select a testimonial from the list to view its details.
      </p>
    </div>
  );
}

// ── Loading skeleton (body only — header renders separately) ───────────────

function DetailBodySkeleton({ isPage }: { isPage: boolean }) {
  return (
    <div className={cn("flex-1 space-y-6", isPage ? "px-6 py-6" : "px-5 py-5")}>
      {/* Author */}
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-full animate-shimmer" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-28 animate-shimmer" />
          <Skeleton className="h-3 w-20 animate-shimmer" />
        </div>
      </div>
      {/* Content */}
      <div className="space-y-2 pl-3 border-l-2 border-border">
        <Skeleton className="h-3 w-full animate-shimmer" />
        <Skeleton className="h-3 w-5/6 animate-shimmer" />
        <Skeleton className="h-3 w-3/5 animate-shimmer" />
      </div>
      {/* Status pills */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full animate-shimmer" />
        <Skeleton className="h-6 w-24 rounded-full animate-shimmer" />
      </div>
    </div>
  );
}

// ── Metadata row helper ───────────────────────────────────────────────────────

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="size-3.5 shrink-0 text-muted-foreground/60" />
      <span className="w-16 shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-medium text-foreground">{value}</span>
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
  const isPage = variant === "page";
  const t = testimonial;
  const cfg = t ? STATUS_CONFIG[t.moderationStatus] : null;
  const isActionable = t
    ? t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED"
    : false;

  // Empty state — no header needed
  if (!loading && !t) return <DetailEmpty />;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header bar — always visible, never part of skeleton */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border shrink-0",
          isPage ? "px-6 h-12" : "px-5 h-11"
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

      {/* Loading skeleton — only the body */}
      {loading && <DetailBodySkeleton isPage={isPage} />}

      {/* Scrollable body — only when we have data */}
      {t && cfg && (
        <ScrollArea className="flex-1">
          <div key={t.id} className="detail-content-enter">
            <div className={cn(isPage ? "px-6" : "px-5")}>
              {/* ── Author ── */}
              <div
                className="py-5 detail-section-enter"
                style={{ animationDelay: "0ms" }}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background select-none">
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
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[t.authorRole, t.authorCompany]
                          .filter(Boolean)
                          .join(" at ")}
                      </p>
                    )}
                    {t.authorEmail && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MailIcon className="size-3 shrink-0" />
                        {t.authorEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Rating ── */}
              {t.rating != null && (
                <div
                  className="pb-4 detail-section-enter"
                  style={{ animationDelay: "30ms" }}
                >
                  <Stars rating={t.rating} />
                </div>
              )}

              {/* ── Content (blockquote accent) ── */}
              <div
                className="pb-5 detail-section-enter"
                style={{ animationDelay: "60ms" }}
              >
                <div className="relative rounded-lg bg-muted/40 p-4">
                  <QuoteIcon className="absolute top-3 right-3 size-5 text-muted-foreground/15" />
                  <p className="text-sm leading-relaxed text-foreground pr-6">
                    {t.content}
                  </p>
                </div>
              </div>

              {/* ── Status + metadata ── */}
              <div
                className="border-t border-border py-5 space-y-4 detail-section-enter"
                style={{ animationDelay: "90ms" }}
              >
                {/* Status pills */}
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
                  <div className="flex items-start gap-2">
                    <TagIcon className="size-3.5 mt-0.5 text-muted-foreground/60 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {t.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-brand-muted px-2 py-0.5 text-[10px] font-medium text-brand"
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
                    <div className="flex items-center gap-1.5 mb-2">
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
              </div>

              {/* ── Metadata grid ── */}
              <div
                className="border-t border-border py-4 detail-section-enter"
                style={{ animationDelay: "120ms" }}
              >
                <MetaRow
                  icon={CalendarIcon}
                  label="Submitted"
                  value={t.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                />
                {t.source && (
                  <MetaRow
                    icon={GlobeIcon}
                    label="Source"
                    value={t.source}
                  />
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}

      {/* ── Sticky action footer ── */}
      {t && ((isActionable && (onApprove || onReject)) || onTogglePublish) && (
        <div
          className={cn(
            "shrink-0 border-t border-border bg-background/95 backdrop-blur-sm",
            isPage ? "px-6 py-4" : "px-5 py-3"
          )}
        >
          <div className="flex items-center gap-2">
            {isActionable && onApprove && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 hover:bg-success/8 hover:text-success hover:border-success/30 active:scale-[0.97]"
                onClick={() => onApprove(t.id)}
              >
                <CheckCircle2Icon className="size-3.5" />
                Approve
                {!isPage && <Kbd className="ml-auto">a</Kbd>}
              </Button>
            )}
            {isActionable && onReject && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 hover:bg-destructive/6 hover:text-destructive hover:border-destructive/30 active:scale-[0.97]"
                onClick={() => onReject(t.id)}
              >
                <XCircleIcon className="size-3.5" />
                Reject
                {!isPage && <Kbd className="ml-auto">r</Kbd>}
              </Button>
            )}
            {onTogglePublish && (
              <Button
                size="sm"
                variant={isActionable ? "ghost" : "outline"}
                className={cn(
                  "gap-1.5 active:scale-[0.97]",
                  isActionable
                    ? "text-muted-foreground hover:text-foreground"
                    : "flex-1"
                )}
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
                {!isPage && <Kbd className="ml-auto">p</Kbd>}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
