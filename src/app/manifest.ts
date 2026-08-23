import type { MetadataRoute } from "next";

// Next.js 16 App Router native manifest support (app/manifest.ts is built
// and served at /manifest.webmanifest automatically — no separate static
// JSON file to keep in sync with app metadata).
//
// Colors match the existing design tokens in globals.css:
//   theme_color -> --color-primary (--p-ink-800, #0f2a3d)
//   background_color -> --color-bg (--p-paper-100, #f7f4ee)
// Keep these in sync by hand if the palette in globals.css ever changes —
// manifest values can't reference CSS custom properties.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sotorko — সতর্কো",
    short_name: "Sotorko",
    description:
      "A crowdsourced, anonymous safety map for women navigating Dhaka.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ee",
    theme_color: "#0f2a3d",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
