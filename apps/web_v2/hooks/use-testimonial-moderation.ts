import * as React from "react";
import {
  useApproveTestimonial,
  useRejectTestimonial,
  usePublishTestimonial,
} from "@/hooks/api";

/**
 * Encapsulates moderation actions for a testimonial detail view. Mutations
 * invalidate the list and detail queries on success, so the UI reflects the
 * new server state on the next refetch. Inline list actions reuse the same
 * mutations so the cache stays consistent across surfaces.
 */
export function useTestimonialModeration(slug: string) {
  const approveMutation = useApproveTestimonial(slug);
  const rejectMutation = useRejectTestimonial(slug);
  const publishMutation = usePublishTestimonial(slug);

  const handleApprove = React.useCallback(
    (id: string) => {
      approveMutation.mutate(id);
    },
    [approveMutation],
  );

  const handleReject = React.useCallback(
    (id: string) => {
      rejectMutation.mutate(id);
    },
    [rejectMutation],
  );

  const handleTogglePublish = React.useCallback(
    (id: string, published: boolean) => {
      publishMutation.mutate({ testimonialId: id, published });
    },
    [publishMutation],
  );

  return {
    handleApprove,
    handleReject,
    handleTogglePublish,
    handleInlineApprove: handleApprove,
    handleInlineReject: handleReject,
  };
}
