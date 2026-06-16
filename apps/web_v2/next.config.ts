import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

function getApiOrigin() {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

  try {
    return new URL(configured).origin;
  } catch {
    return "http://localhost:8100";
  }
}

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Storage origins the browser talks to directly. `connect-src` needs the
 * presigned-PUT upload target so the media uploader's
 * `xhr.PUT(intent.uploadUrl)` isn't blocked (image display is already covered
 * by `img-src https:`). AWS virtual-hosted and path-style URLs both live under
 * `*.amazonaws.com`; a custom S3 endpoint or CDN is added from env when set.
 */
function getStorageOrigins(): string[] {
  const origins = new Set<string>(["https://*.amazonaws.com"]);
  const cdn = originOf(process.env.NEXT_PUBLIC_S3_PUBLIC_CDN_BASE_URL);
  if (cdn) origins.add(cdn);
  const endpoint = originOf(process.env.NEXT_PUBLIC_S3_ENDPOINT);
  if (endpoint) origins.add(endpoint);
  return [...origins];
}

const cspDirectives = [
  ["default-src", "'self'"],
  ["base-uri", "'self'"],
  ["object-src", "'none'"],
  ["frame-ancestors", "'none'"],
  ["form-action", "'self'"],
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
    "https://checkout.razorpay.com",
    "https://*.semblia.com",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://clerk.com",
    "https://challenges.cloudflare.com",
  ],
  ["style-src", "'self'", "'unsafe-inline'"],
  ["img-src", "'self'", "data:", "blob:", "https:"],
  ["font-src", "'self'", "data:"],
  ["media-src", "'self'", "data:", "blob:", "https:"],
  [
    "connect-src",
    "'self'",
    getApiOrigin(),
    "https://semblia.com",
    "https://*.semblia.com",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://clerk.com",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
    ...getStorageOrigins(),
    ...(isProduction
      ? []
      : [
          "http://localhost:*",
          "http://127.0.0.1:*",
          "ws://localhost:*",
          "ws://127.0.0.1:*",
        ]),
  ],
  [
    "frame-src",
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
    "https://*.semblia.com",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://clerk.com",
    "https://challenges.cloudflare.com",
  ],
  ["worker-src", "'self'", "blob:"],
  ["manifest-src", "'self'"],
];

export const contentSecurityPolicy = cspDirectives
  .map(([directive, ...sources]) => `${directive} ${sources.join(" ")}`)
  .join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/settings/profile",
        destination: "/account/profile",
        permanent: true,
      },
      {
        source: "/settings/billing",
        destination: "/account/billing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
