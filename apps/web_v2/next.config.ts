import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
