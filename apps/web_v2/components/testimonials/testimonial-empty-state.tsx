import { ChatText as MessageSquareTextIcon } from "@phosphor-icons/react";
import type { ModerationStatus } from "@/lib/mock-data";

type StatusFilter = ModerationStatus | "ALL";

const MESSAGES: Record<StatusFilter, { title: string; desc: string }> = {
  ALL: {
    title: "No testimonials yet",
    desc: "Share your collection link to start gathering testimonials.",
  },
  PENDING: {
    title: "Nothing pending",
    desc: "All testimonials have been reviewed.",
  },
  FLAGGED: {
    title: "No flagged items",
    desc: "Auto-moderation has not flagged anything recently.",
  },
  APPROVED: {
    title: "No approved testimonials",
    desc: "Approve testimonials to publish them to your widgets.",
  },
  REJECTED: {
    title: "No rejected testimonials",
    desc: "Rejected testimonials will appear here.",
  },
};

export function TestimonialEmptyState({ filter }: { filter: StatusFilter }) {
  const { title, desc } = MESSAGES[filter];

  return (
    <div className="flex flex-col items-center py-20 px-6 text-center animate-fade-up">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
        <MessageSquareTextIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}
