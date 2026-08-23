import type { Metadata, Viewport } from "next";
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
    "A crowdsourced safety map built by and for women in Dhaka. See what's been reported nearby, and share what happened to you — anonymously.",
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
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <I18nProvider>
          <ServiceWorkerRegistration />
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <InstallPrompt />
        </I18nProvider>
      </body>
    </html>
  );
}
