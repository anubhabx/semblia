"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TestimonialDetail } from "@/components/testimonials/testimonial-detail";
import {
  apiApproveTestimonial,
  apiRejectTestimonial,
  apiPublishTestimonial,
} from "@/lib/api";
import type { MockTestimonial, ModerationStatus } from "@/lib/mock-data";

interface Props {
  testimonial: MockTestimonial;
  projectSlug: string;
}

export function TestimonialDetailPage({ testimonial, projectSlug }: Props) {
  const router = useRouter();
  const [t, setT] = React.useState(testimonial);

  const handleApprove = React.useCallback((id: string) => {
    apiApproveTestimonial(id);
    setT((prev) => ({
      ...prev,
      moderationStatus: "APPROVED" as ModerationStatus,
      isApproved: true,
    }));
  }, []);

  const handleReject = React.useCallback((id: string) => {
    apiRejectTestimonial(id);
    setT((prev) => ({
      ...prev,
      moderationStatus: "REJECTED" as ModerationStatus,
    }));
  }, []);

  const handleTogglePublish = React.useCallback(
    (id: string, published: boolean) => {
      apiPublishTestimonial(id, published);
      setT((prev) => ({ ...prev, isPublished: published }));
    },
    [],
  );

  return (
    <div className="flex flex-1 flex-col">
      <TestimonialDetail
        testimonial={t}
        variant="page"
        showBack
        onBack={() => router.push(`/projects/${projectSlug}/testimonials`)}
        onApprove={handleApprove}
        onReject={handleReject}
        onTogglePublish={handleTogglePublish}
      />
    </div>
  );
}
