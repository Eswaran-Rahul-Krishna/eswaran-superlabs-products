import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["swagger-ui-react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "virgincodes.com",
      },
      {
        protocol: "https",
        hostname: "cdn.virgincodes.com",
      },
    ],
  },
};

export default nextConfig;
