import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["swagger-ui-react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
