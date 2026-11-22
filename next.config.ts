import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Halaman beranda tetap berupa HTML statis di public/index.html.
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
};

export default nextConfig;
