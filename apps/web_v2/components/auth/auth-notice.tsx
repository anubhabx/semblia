import { AlertCircle } from "lucide-react";

interface AuthNoticeProps {
  error: string | null;
}

export function AuthNotice({ error }: AuthNoticeProps) {
  if (!error) return null;
  return (
    <div className="auth-notice-in flex items-start gap-2 rounded-lg bg-destructive/8 border border-destructive/15 p-3">
      <AlertCircle className="size-3.5 shrink-0 text-destructive mt-0.5" />
      <p className="text-xs text-destructive leading-relaxed">{error}</p>
    </div>
  );
}
