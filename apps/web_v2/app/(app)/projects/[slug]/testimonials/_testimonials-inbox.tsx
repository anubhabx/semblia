"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { TestimonialsClient } from "@/components/testimonials/testimonials-client";
import { TestimonialDetail } from "@/components/testimonials/testimonial-detail";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  apiGetTestimonial,
  apiApproveTestimonial,
  apiRejectTestimonial,
  apiPublishTestimonial
} from "@/lib/api";
import type { MockTestimonial, ModerationStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ── Props ─────────────────────────────────────────────────────────────────────

interface TestimonialsInboxProps {
  projectId: string;
  projectSlug: string;
  totalCount: number;
  pendingCount: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TestimonialsInbox({
  projectId,
  projectSlug,
  totalCount,
  pendingCount
}: TestimonialsInboxProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<MockTestimonial | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  // Track closing state for exit animation
  const [panelClosing, setPanelClosing] = React.useState(false);
  // Track whether panel should render (stays true during exit animation)
  const [panelVisible, setPanelVisible] = React.useState(false);

  // ── Fetch detail when selection changes ──
  React.useEffect(() => {
    if (!selectedId) {
      return;
    }

    let cancelled = false;
    // Clear stale detail immediately so user sees loading skeleton
    setDetail(null);
    setDetailLoading(true);

    apiGetTestimonial(projectId, selectedId).then((data) => {
      if (!cancelled) {
        setDetail(data);
        setDetailLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, selectedId]);

  // Sync panel visibility with selectedId
  React.useEffect(() => {
    if (selectedId) {
      setPanelClosing(false);
      setPanelVisible(true);
    }
  }, [selectedId]);

  // ── Selection handler — desktop inline, mobile navigate ──
  const handleSelect = React.useCallback(
    (id: string) => {
      if (isDesktop) {
        setSelectedId((prev) => (prev === id ? prev : id));
      } else {
        router.push(`/projects/${projectSlug}/testimonials/${id}`);
      }
    },
    [isDesktop, projectSlug, router]
  );

  const handleCloseDetail = React.useCallback(() => {
    setPanelClosing(true);
    // Wait for exit animation to complete before unmounting
    setTimeout(() => {
      setSelectedId(null);
      setDetail(null);
      setPanelClosing(false);
      setPanelVisible(false);
    }, 200);
  }, []);

  // ── Optimistic moderation for detail panel ──
  const handleApprove = React.useCallback((id: string) => {
    apiApproveTestimonial(id);
    setDetail((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            moderationStatus: "APPROVED" as ModerationStatus,
            isApproved: true
          }
        : prev
    );
  }, []);

  const handleReject = React.useCallback((id: string) => {
    apiRejectTestimonial(id);
    setDetail((prev) =>
      prev && prev.id === id
        ? { ...prev, moderationStatus: "REJECTED" as ModerationStatus }
        : prev
    );
  }, []);

  const handleTogglePublish = React.useCallback(
    (id: string, published: boolean) => {
      apiPublishTestimonial(id, published);
      setDetail((prev) =>
        prev && prev.id === id ? { ...prev, isPublished: published } : prev
      );
    },
    []
  );

  // ── Inline actions from list (optimistic) ──
  const handleInlineApprove = React.useCallback((id: string) => {
    apiApproveTestimonial(id);
    // If currently viewing this item in detail, update it too
    setDetail((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            moderationStatus: "APPROVED" as ModerationStatus,
            isApproved: true
          }
        : prev
    );
  }, []);

  const handleInlineReject = React.useCallback((id: string) => {
    apiRejectTestimonial(id);
    setDetail((prev) =>
      prev && prev.id === id
        ? { ...prev, moderationStatus: "REJECTED" as ModerationStatus }
        : prev
    );
  }, []);

  // ── Clear selection when switching to mobile ──
  React.useEffect(() => {
    if (!isDesktop) {
      setSelectedId(null);
      setDetail(null);
      setPanelVisible(false);
    }
  }, [isDesktop]);

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4 px-6 h-14 border-b border-border shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            Testimonials
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {totalCount} total
              {pendingCount > 0 && (
                <>
                  {" \u00b7 "}
                  <span className="font-medium text-warning">
                    {pendingCount} pending
                  </span>
                </>
              )}
            </span>
          </h1>
        </div>
      </div>

      {/* ── Master-detail split ── */}
      <div className="flex flex-1 min-h-0">
        {/* List column */}
        <div className="flex flex-1 flex-col min-w-0">
          <TestimonialsClient
            projectId={projectId}
            projectSlug={projectSlug}
            totalCount={totalCount}
            selectedId={selectedId}
            onSelect={handleSelect}
            onInlineApprove={handleInlineApprove}
            onInlineReject={handleInlineReject}
          />
        </div>

        {/* Detail column — desktop only, animated slide in/out */}
        {panelVisible && (
          <div
            className={cn(
              "hidden lg:flex lg:w-[420px] lg:shrink-0 flex-col border-l border-border bg-background overflow-hidden",
              panelClosing
                ? "detail-panel-slide-exit"
                : "detail-panel-slide-enter"
            )}
          >
            <TestimonialDetail
              testimonial={detail}
              loading={detailLoading}
              onClose={handleCloseDetail}
              onApprove={handleApprove}
              onReject={handleReject}
              onTogglePublish={handleTogglePublish}
            />
          </div>
        )}
      </div>
    </div>
  );
}
