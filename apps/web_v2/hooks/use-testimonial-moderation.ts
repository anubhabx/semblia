import * as React from "react";
import {
  apiApproveTestimonial,
  apiRejectTestimonial,
  apiPublishTestimonial,
} from "@/lib/api";
import type { MockTestimonial, ModerationStatus } from "@/lib/mock-data";

/**
 * Encapsulates optimistic moderation updates for a testimonial detail view.
 * Returns stable callbacks for approve, reject, toggle-publish, and
 * inline list actions — all performing optimistic local state updates.
 */
export function useTestimonialModeration(
  detail: MockTestimonial | null,
  setDetail: React.Dispatch<React.SetStateAction<MockTestimonial | null>>,
) {
  const handleApprove = React.useCallback(
    (id: string) => {
      apiApproveTestimonial(id);
      setDetail((prev) =>
        prev && prev.id === id
          ? {
              ...prev,
              moderationStatus: "APPROVED" as ModerationStatus,
              isApproved: true,
            }
          : prev,
      );
    },
    [setDetail],
  );

  const handleReject = React.useCallback(
    (id: string) => {
      apiRejectTestimonial(id);
      setDetail((prev) =>
        prev && prev.id === id
          ? { ...prev, moderationStatus: "REJECTED" as ModerationStatus }
          : prev,
      );
    },
    [setDetail],
  );

  const handleTogglePublish = React.useCallback(
    (id: string, published: boolean) => {
      apiPublishTestimonial(id, published);
      setDetail((prev) =>
        prev && prev.id === id ? { ...prev, isPublished: published } : prev,
      );
    },
    [setDetail],
  );

  // Inline actions from list (optimistic) — same logic, reused
  const handleInlineApprove = React.useCallback(
    (id: string) => {
      apiApproveTestimonial(id);
      setDetail((prev) =>
        prev && prev.id === id
          ? {
              ...prev,
              moderationStatus: "APPROVED" as ModerationStatus,
              isApproved: true,
            }
          : prev,
      );
    },
    [setDetail],
  );

  const handleInlineReject = React.useCallback(
    (id: string) => {
      apiRejectTestimonial(id);
      setDetail((prev) =>
        prev && prev.id === id
          ? { ...prev, moderationStatus: "REJECTED" as ModerationStatus }
          : prev,
      );
    },
    [setDetail],
  );

  return {
    handleApprove,
    handleReject,
    handleTogglePublish,
    handleInlineApprove,
    handleInlineReject,
  };
}
