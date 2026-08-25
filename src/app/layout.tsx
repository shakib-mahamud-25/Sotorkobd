import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { I18nProvider } from "@/lib/i18n/context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "Sotorko — Women's Safety Map for Dhaka",
  description:
    "A crowdsourced safety map for women in Dhaka. See what's been reported nearby, and share what happened to you — anonymously.",
  // PWA: iOS doesn't read app/manifest.ts the same way Chrome/Android does,
  // so these apple-specific tags are needed for a good iOS home-screen
  // experience (standalone display, correct title). See
  // docs/PROJECT_CONTEXT_v2_patch.md for the full PWA notes.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sotorko",
  },
};

// theme_color also lives in app/manifest.ts for Android/Chrome's install
// banner; Next's viewport export additionally emits the <meta name="theme-color">
// tag that Safari/iOS and the browser chrome (URL bar tint) read directly.
export const viewport: Viewport = {
  themeColor: "#0f2a3d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Fix (round 2 — h-full on <html> was the actual root cause the first
    // h-dvh patch on the map page alone didn't address): Tailwind's h-full
    // compiles to height: 100%. On <html> specifically, "100% of what?"
    // resolves against the browser's initial containing block, which is
    // sized using the LAYOUT viewport, not the dynamic one — the same
    // category of stale-viewport problem as a literal 100vh, just one level
    // removed. Every descendant relying on percentage/flex height (body,
    // main, the map page's containers) inherited that stale ceiling no
    // matter what dvh units were used further down the tree. h-dvh on
    // <html> anchors the ENTIRE chain to the real, live visual viewport
    // height from the root, so downstream h-full/flex-1/100% math is
    // finally resolving against a correct number.
    <html lang="en" className="h-dvh antialiased">
      <body className="flex h-dvh flex-col">
        <I18nProvider>
          <ServiceWorkerRegistration />
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <InstallPrompt />
        </I18nProvider>
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "147f3c2044624a73a6c7fa08d13d7055"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
