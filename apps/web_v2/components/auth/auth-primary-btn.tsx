import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface AuthPrimaryBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function AuthPrimaryBtn({
  loading,
  loadingLabel = "Loading…",
  children,
  disabled,
  className,
  ...props
}: AuthPrimaryBtnProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        "w-full h-10 rounded-lg bg-primary text-primary-foreground",
        "text-sm font-medium",
        "flex items-center justify-center gap-2",
        "hover:opacity-90 transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "auth-btn",
        className
      )}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
