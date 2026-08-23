import type { NextConfig } from "next";

// V2 fix (Phase 9): this file was previously empty. Cloudinary is already
// configured server-side to compress/transform images on upload (see
// src/app/api/upload/route.ts — quality: "auto:good", fetch_format: "auto"),
// but nothing in this app used next/image, so none of Next's own responsive
// srcset generation, lazy-loading-by-default, or format negotiation was
// happening on top of that. Admin photo review currently uses plain <img>
// tags (src/app/admin/... and the report form's photo previews) — this
// config is what's needed if/when those are switched to next/image; it
// doesn't retroactively change any existing <img> usage on its own.
//
// remotePatterns (not the older, deprecated `domains` array) is required by
// Next.js to allow next/image to optimize images from an external host —
// without this, next/image would reject any Cloudinary URL outright.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
