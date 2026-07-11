import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { I18nProvider } from "@/lib/i18n/context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sotorko — Women's Safety Map for Dhaka",
  description:
    "A crowdsourced safety map built by and for women in Dhaka. See what's been reported nearby, and share what happened to you — anonymously.",
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
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
