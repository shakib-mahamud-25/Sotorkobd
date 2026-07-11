"use client";

import { useI18n } from "@/lib/i18n/context";
import { getSeverityColor } from "@/lib/categories";

export function SeverityStep({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-ink">
        {t("report.severity.title")}
      </h2>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-ink"
          style={{ accentColor: getSeverityColor(value) }}
        />
        <div
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: getSeverityColor(value) }}
        >
          {value}
        </div>
      </div>
      <div className="flex justify-between text-xs text-text-soft">
        <span>{t("report.severity.1")}</span>
        <span>{t("report.severity.5")}</span>
      </div>
    </div>
  );
}
