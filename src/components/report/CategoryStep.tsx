"use client";

import { useI18n } from "@/lib/i18n/context";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/lib/iconMap";

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
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-ink">
        {t("report.category.title")}
      </h2>
      <p className="text-xs text-text-soft">{t("report.category.multiHint")}</p>
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
                  // can't deselect the primary directly; pick another as primary instead
                  return;
                } else {
                  onAdditionalToggle(cat.id);
                }
              }}
              className={`flex flex-col items-start gap-2 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                isSelected
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-paper-raised hover:border-ink/50"
              }`}
            >
              <CategoryIcon name={cat.icon} size={20} />
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
