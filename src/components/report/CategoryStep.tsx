"use client";

import { useI18n } from "@/lib/i18n/context";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/lib/iconMap";
import { Check } from "lucide-react";

export function CategoryStep({
  primaryCategory,
  additionalCategories,
  onPrimaryChange,
  onAdditionalToggle,
}: {
  primaryCategory: string | null;
  additionalCategories: string[];
  onPrimaryChange: (id: string) => void;
  onAdditionalToggle: (id: string) => void;
}) {
  const { t, locale } = useI18n();

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h2 className="text-heading text-[var(--color-primary)]">
          {t("report.category.title")}
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {t("report.category.multiHint")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const isPrimary = primaryCategory === cat.id;
          const isAdditional = additionalCategories.includes(cat.id);
          const isSelected = isPrimary || isAdditional;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (!primaryCategory) {
                  onPrimaryChange(cat.id);
                } else if (isPrimary) {
                  return;
                } else {
                  onAdditionalToggle(cat.id);
                }
              }}
              aria-pressed={isSelected}
              className={`relative flex flex-col items-start gap-2.5 rounded-[var(--radius-lg)] border px-4 py-3.5 text-left transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] active:scale-[0.98] ${
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-hover-tint)]"
              }`}
            >
              {isSelected && (
                <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
              <CategoryIcon name={cat.icon} size={19} />
              <span className="text-xs font-medium leading-snug">
                {getCategoryLabel(cat.id, locale)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
