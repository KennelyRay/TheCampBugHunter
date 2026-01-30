import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minotar.net",
        pathname: "/helm/**",
      },
    ],
  },
};

export default nextConfig;
