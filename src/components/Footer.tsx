"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <span className="text-display-sm text-[var(--color-primary)]">
              সতর্ক
              <span className="ml-2 text-base font-normal text-[var(--color-text-secondary)]">
                Sotorko
              </span>
            </span>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {t("footer.mission")}
            </p>
          </div>
          <div className="flex gap-10 text-sm">
            <Link
              href="/about"
              className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
            >
              {t("footer.guidelines")}
            </Link>
            <Link
              href="/about#privacy"
              className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
            >
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Sotorko · A non-profit initiative
        </div>
      </div>
    </footer>
  );
}
