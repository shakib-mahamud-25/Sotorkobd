"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/map", label: t("nav.map") },
    { href: "/report", label: t("nav.report") },
    { href: "/about", label: t("nav.about") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            সতর্ক
          </span>
          <span className="hidden text-sm text-text-soft sm:inline">Sotorko</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-ink ${
                pathname === link.href ? "text-ink" : "text-text-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
            aria-label="Switch language"
          >
            {locale === "en" ? "বাংলা" : "English"}
          </button>
          <Link
            href="/report"
            className="hidden rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] sm:block"
          >
            {t("nav.report")}
          </Link>
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-line px-5 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-text hover:bg-paper-raised"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
