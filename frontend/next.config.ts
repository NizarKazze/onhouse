import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: there is an unrelated package-lock.json further up
  // the tree that Turbopack would otherwise try to adopt.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
