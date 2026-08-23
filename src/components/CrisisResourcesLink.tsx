"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { LifeBuoy } from "lucide-react";

// A single quiet, contextual line — not a banner, not a modal, not a
// colored alert box. Meant to sit unobtrusively wherever it's placed (the
// report form, map sidebar, about page) so it's discoverable without being
// dramatic. Per spec: "These would be contextual rather than a giant
// permanent emergency banner."
export function CrisisResourcesLink({ className = "" }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Link
      href="/resources"
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] ${className}`}
    >
      <LifeBuoy size={13} />
      {t("resources.needHelp")}
    </Link>
  );
}
