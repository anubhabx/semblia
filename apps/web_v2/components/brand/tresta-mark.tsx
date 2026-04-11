import { cn } from "@/lib/utils";

export function TrestaMarkIcon({
  size = 13,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M7 1L13 4V10L7 13L1 10V4L7 1Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export function TrestaWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0 bg-brand text-card">
        <TrestaMarkIcon size={13} />
      </div>
      <span className="font-semibold tracking-tight text-[1.05rem] text-foreground">
        Tresta
      </span>
    </div>
  );
}
