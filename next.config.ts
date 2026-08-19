import type { NextConfig } from "next";

// ─── Security headers applied to every response ───────────────────────────────
const SECURITY_HEADERS = [
  // Enforce HTTPS for 1 year; include subdomains
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // Block the page from being embedded in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Disable MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Minimal referrer info
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable features that aren't needed
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Content-Security-Policy
  // 'unsafe-inline' for styles is required by Tailwind/CSS-in-JS at runtime.
  // Tighten further once a nonce strategy is implemented.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: allow self + Google (OAuth redirect)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      // Styles: allow self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: allow self + data URIs + Supabase storage + remote image sources
      "img-src 'self' data: blob: https:",
      // Connections: allow self + Supabase API + Backblaze B2
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://*.backblazeb2.com",
      // Frames: deny all iframes
      "frame-src 'none'",
      // Workers
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  headers: async () => [
    {
      // Apply security headers to all routes
      source: "/(.*)",
      headers: SECURITY_HEADERS,
    },
    {
      // Cache static assets in /images, /svg, /university-logos, /videos for 1 year
      source: "/:path(images|svg|university-logos|videos)/:file*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache data files (e.g. world-110m.json) for 1 year
      source: "/data/:file*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
