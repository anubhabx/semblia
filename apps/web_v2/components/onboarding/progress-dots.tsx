import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  current: number;
  total: number;
}

export function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <div
      className="flex items-center justify-center gap-1.5 mt-8"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i === current
              ? "w-5 bg-brand"
              : i < current
                ? "w-1.5 bg-brand/40"
                : "w-1.5 bg-border",
          )}
        />
      ))}
    </div>
  );
}
