"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Menu, X, Languages } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/map", label: t("nav.map") },
    { href: "/report", label: t("nav.report") },
    { href: "/about", label: t("nav.about") },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-[var(--color-bg)]/90 backdrop-blur-md transition-shadow duration-[var(--duration-base)] ${
        scrolled ? "border-[var(--color-border)] shadow-[var(--shadow-xs)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-lg"
          aria-label="Sotorko home"
        >
          <span className="text-display-sm text-[var(--color-primary)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] group-hover:-translate-y-px">
            সতর্ক
          </span>
          <span className="hidden text-sm text-[var(--color-text-secondary)] sm:inline">
            Sotorko
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-[var(--duration-base)] ${
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-hover-tint)]"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-[1px] h-[2px] rounded-full bg-[var(--color-primary)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-all duration-[var(--duration-base)] hover:bg-[var(--color-primary)] hover:text-white active:scale-95"
            aria-label="Switch language"
          >
            <Languages size={13} />
            {locale === "en" ? "বাংলা" : "English"}
          </button>
          <Link
            href="/report"
            className="hidden items-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-sm)] active:scale-[0.97] sm:flex"
          >
            {t("nav.report")}
          </Link>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-primary)] transition-colors hover:bg-[var(--color-hover-tint)] md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out)] md:hidden ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 border-t border-[var(--color-border)] px-5 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-[var(--color-hover-tint)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover-tint)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
