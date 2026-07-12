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
  const color = getSeverityColor(value);
  const percent = ((value - 1) / 4) * 100;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-heading text-[var(--color-primary)]">
        {t("report.severity.title")}
      </h2>

      <div className="flex flex-col items-center gap-5 py-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-[var(--shadow-md)] transition-colors duration-[var(--duration-base)]"
          style={{ backgroundColor: color }}
        >
          {value}
        </div>

        <div className="w-full px-1">
          <div className="relative">
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-all duration-[var(--duration-base)]"
              style={{ width: `${percent}%`, backgroundColor: color }}
            />
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="relative z-10 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border-strong)]"
              style={{ accentColor: color }}
            />
          </div>
          <div className="mt-2 flex justify-between px-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`text-[10px] font-medium transition-colors ${
                  n === value ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
                }`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
        <span>{t("report.severity.1")}</span>
        <span>{t("report.severity.5")}</span>
      </div>
    </div>
  );
}
