"use client";

import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/Input";
import type { TimeOfDay } from "@/types";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

const TIME_OPTIONS: { id: TimeOfDay; icon: React.ReactNode; labelKey: "report.time.morning" | "report.time.afternoon" | "report.time.evening" | "report.time.night" }[] = [
  { id: "morning", icon: <Sunrise size={18} />, labelKey: "report.time.morning" },
  { id: "afternoon", icon: <Sun size={18} />, labelKey: "report.time.afternoon" },
  { id: "evening", icon: <Sunset size={18} />, labelKey: "report.time.evening" },
  { id: "night", icon: <Moon size={18} />, labelKey: "report.time.night" },
];

export function TimeDateStep({
  timeOfDay,
  incidentDate,
  onTimeChange,
  onDateChange,
}: {
  timeOfDay: TimeOfDay | null;
  incidentDate: string;
  onTimeChange: (t: TimeOfDay) => void;
  onDateChange: (d: string) => void;
}) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="animate-fade-in space-y-7">
      <div>
        <h2 className="text-heading text-[var(--color-primary)]">
          {t("report.time.title")}
        </h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {TIME_OPTIONS.map((opt) => {
            const active = timeOfDay === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onTimeChange(opt.id)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border px-2 py-3.5 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] active:scale-[0.97] ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-hover-tint)]"
                }`}
              >
                {opt.icon}
                <span className="text-[11px] font-medium">{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-heading text-[var(--color-primary)]">
          {t("report.date.title")}
        </h2>
        <Input
          type="date"
          max={today}
          value={incidentDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="mt-3"
        />
      </div>
    </div>
  );
}
