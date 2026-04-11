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

  // ── Fetch detail when selection changes ──
  React.useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
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
    setSelectedId(null);
    setDetail(null);
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

  // ── Clear selection when switching to mobile ──
  React.useEffect(() => {
    if (!isDesktop) {
      setSelectedId(null);
      setDetail(null);
    }
  }, [isDesktop]);

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Page header ── */}
      <div className="flex items-end justify-between gap-4 px-6 pt-7 pb-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Testimonials
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalCount} total
            {pendingCount > 0 && (
              <>
                {" · "}
                <span className="font-medium text-warning">
                  {pendingCount} pending moderation
                </span>
              </>
            )}
          </p>
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
          />
        </div>

        {/* Detail column — desktop only, visible when a testimonial is selected */}
        {selectedId != null && (
          <div className="hidden lg:flex lg:w-[420px] lg:shrink-0 flex-col border-l border-border bg-background">
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
