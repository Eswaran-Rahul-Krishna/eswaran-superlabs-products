import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["swagger-ui-react"],
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        // Beauty Barn DigitalOcean Spaces (actual image CDN)
        protocol: "https",
        hostname: "beautybarn.blr1.digitaloceanspaces.com",
      },
      {
        // wsrv.nl image proxy (used by the Beauty Barn storefront)
        protocol: "https",
        hostname: "wsrv.nl",
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
