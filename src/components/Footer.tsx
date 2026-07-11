"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-line bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <span className="font-display text-lg font-semibold text-ink">
              সতর্কো Sotorko
            </span>
            <p className="mt-2 text-sm leading-relaxed text-text-soft">
              {t("footer.mission")}
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/about" className="text-text-soft hover:text-ink">
              {t("footer.guidelines")}
            </Link>
            <Link href="/about#privacy" className="text-text-soft hover:text-ink">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-line pt-6 text-xs text-text-soft">
          © {new Date().getFullYear()} Sotorko. A non-profit initiative.
        </div>
      </div>
    </footer>
  );
}
