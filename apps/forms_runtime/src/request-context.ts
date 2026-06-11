export type HostedFormRequestContext = {
  host: string;
  projectPublicSlug: string;
  formSlug: string | null;
  path: string;
};

const submitSuffix = "/__submit";
const embedSuffix = "/__embed";

/** `/feedback/__embed` → `/feedback`; non-embed paths pass through. */
export function toEmbeddedFormPath(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === embedSuffix) return "/";
  if (!normalized.endsWith(embedSuffix)) return normalized;
  return normalized.slice(0, -embedSuffix.length) || "/";
}

export function toSubmitPath(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === "/") return submitSuffix;
  return `${normalized}${submitSuffix}`;
}

export function toSubmittedFormPath(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === submitSuffix) return "/";
  if (!normalized.endsWith(submitSuffix)) return normalized;
  const formPath = normalized.slice(0, -submitSuffix.length);
  return formPath || "/";
}

export function resolveRequestContext(input: {
  host: string | undefined;
  url: string | undefined;
  baseDomain: string;
}): HostedFormRequestContext {
  const host = normalizeHost(input.host);
  if (!host || !isSupportedHostedHost(host, input.baseDomain)) {
    throw new Error("Unsupported hosted form host");
  }

  const projectPublicSlug = host.endsWith(`.${input.baseDomain}`)
    ? host.slice(0, host.length - input.baseDomain.length - 1)
    : deriveCustomHostRoutingSlug(host);
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(projectPublicSlug)) {
    throw new Error("Invalid hosted form project slug");
  }

  const parsed = new URL(input.url ?? "/", `https://${host}`);
  const path = normalizePath(parsed.pathname);
  const segments = path.split("/").filter(Boolean);

  return {
    host,
    projectPublicSlug,
    formSlug: segments[0] ?? null,
    path,
  };
}

function normalizeHost(host: string | undefined): string | null {
  const normalized = host?.split(":")[0]?.trim().toLowerCase();
  return normalized ? normalized.replace(/\.+$/, "") : null;
}

function isSupportedHostedHost(host: string, baseDomain: string): boolean {
  if (host.endsWith(`.${baseDomain}`)) return true;

  const labels = host.split(".");
  if (labels.length < 2) return false;

  return labels.every((label) =>
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label),
  );
}

function deriveCustomHostRoutingSlug(host: string): string {
  const firstLabel = host.split(".")[0] ?? "";
  return /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(firstLabel)
    ? firstLabel
    : "custom-domain";
}

function normalizePath(path: string): string {
  const normalized = path.replace(/\/+$/, "") || "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
