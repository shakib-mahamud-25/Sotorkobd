"use client";

import { useI18n } from "@/lib/i18n/context";
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
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("report.time.title")}
        </h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onTimeChange(opt.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-colors ${
                timeOfDay === opt.id
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-paper-raised hover:border-ink/50"
              }`}
            >
              {opt.icon}
              <span className="text-[11px] font-medium">{t(opt.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("report.date.title")}
        </h2>
        <input
          type="date"
          max={today}
          value={incidentDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="mt-3 w-full rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm focus:border-ink"
        />
      </div>
    </div>
  );
}
