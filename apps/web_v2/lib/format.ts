/** Shared formatting / display helpers used across the app. */

/** First two initials from a multi-word name, e.g. "Acme Corp" → "AC". */
export function projectInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Full display name from Clerk user fields, falling back to email. */
export function userDisplayName(
  firstName: string | null,
  lastName: string | null,
  email: string,
): string {
  return [firstName, lastName].filter(Boolean).join(" ") || email;
}

/** One- or two-char initials from user name fields. */
export function userInitials(
  firstName: string | null,
  lastName: string | null,
  email: string,
): string {
  const initials = [firstName?.[0], lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
  return initials || (email[0] ?? "?").toUpperCase();
}

/** Returns true if the event target is an input, textarea, or contenteditable. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

/** Compact number formatter: 1200 → "1.2k", 1500000 → "1.5M". */
export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/** Relative time from a Date: "2m ago", "3h ago", "5d ago", "Jan 3". */
export function fmtRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const s = diff / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Expiry countdown: "Expires in 3d", "Expires in 2h", "Expired". */
export function fmtExpiry(date: Date): string {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const s = diff / 1000;
  if (s < 3600) return `Expires in ${Math.floor(s / 60)}m`;
  if (s < 86400) return `Expires in ${Math.floor(s / 3600)}h`;
  return `Expires in ${Math.ceil(s / 86400)}d`;
}
