import path from "node:path";
import type { NextConfig } from "next";

/**
 * Backend origin (server-side only). The browser never talks to it directly:
 * `/api/*` on this site is proxied there, so the admin session cookie is
 * first-party and `SameSite=Strict` works without any cross-site setup.
 */
const apiUrl = process.env.API_URL?.replace(/\/+$/, "");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Pin the workspace root: there is an unrelated package-lock.json further up
  // the tree that Turbopack would otherwise try to adopt.
  turbopack: {
    root: path.resolve(__dirname),
  },
  poweredByHeader: false,

  async rewrites() {
    if (!apiUrl) return [];
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      // Images uploaded from the admin (local storage backend).
      { source: "/uploads/:path*", destination: `${apiUrl}/uploads/:path*` },
    ];
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The admin is never indexed and never cached by shared caches.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/admin",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
