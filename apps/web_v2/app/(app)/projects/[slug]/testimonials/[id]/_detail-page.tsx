"use client";

import { useRouter } from "next/navigation";
import { TestimonialDetail } from "@/components/testimonials/testimonial-detail";
import type { MockTestimonial } from "@/lib/mock-data";

interface Props {
  testimonial: MockTestimonial;
  projectSlug: string;
}

export function TestimonialDetailPage({ testimonial, projectSlug }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col">
      <TestimonialDetail
        testimonial={testimonial}
        variant="page"
        showBack
        onBack={() => router.push(`/projects/${projectSlug}/testimonials`)}
      />
    </div>
  );
}
