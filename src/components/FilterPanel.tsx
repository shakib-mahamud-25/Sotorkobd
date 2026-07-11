"use client";

import { useI18n } from "@/lib/i18n/context";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/lib/iconMap";
import type { MapFilters, TimeOfDay } from "@/types";
import { Map as MapIcon, Flame } from "lucide-react";

const DATE_RANGES: MapFilters["dateRange"][] = ["7d", "30d", "6m", "1y", "all"];
const TIME_OPTIONS: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];

export function FilterPanel({
  filters,
  onChange,
  viewMode,
  onViewModeChange,
  resultCount,
}: {
  filters: MapFilters;
  onChange: (f: MapFilters) => void;
  viewMode: "pins" | "heatmap";
  onViewModeChange: (v: "pins" | "heatmap") => void;
  resultCount: number;
}) {
  const { t, locale } = useI18n();

  function toggleCategory(id: string) {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((c) => c !== id)
      : [...filters.categoryIds, id];
    onChange({ ...filters, categoryIds: next });
  }

  function toggleTime(t: TimeOfDay) {
    const next = filters.timeOfDay.includes(t)
      ? filters.timeOfDay.filter((x) => x !== t)
      : [...filters.timeOfDay, t];
    onChange({ ...filters, timeOfDay: next });
  }

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex gap-2 rounded-full border border-line bg-paper-raised p-1">
        <button
          onClick={() => onViewModeChange("pins")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
            viewMode === "pins" ? "bg-ink text-white" : "text-text-soft"
          }`}
        >
          <MapIcon size={14} />
          {t("map.view.pins")}
        </button>
        <button
          onClick={() => onViewModeChange("heatmap")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
            viewMode === "heatmap" ? "bg-ink text-white" : "text-text-soft"
          }`}
        >
          <Flame size={14} />
          {t("map.view.heatmap")}
        </button>
      </div>

      <div className="text-xs text-text-soft">
        {resultCount} {t("map.reportCount")}
      </div>

      {/* Date range */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-soft">
          {t("map.filters.dateRange")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => onChange({ ...filters, dateRange: range })}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.dateRange === range
                  ? "border-ink bg-ink text-white"
                  : "border-line text-text-soft hover:border-ink/50"
              }`}
            >
              {t(`map.filters.dateRange.${range}` as const)}
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-soft">
          {t("map.filters.severity")}: {filters.severityMin}
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={filters.severityMin}
          onChange={(e) =>
            onChange({ ...filters, severityMin: Number(e.target.value) })
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line"
        />
      </div>

      {/* Time of day */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-soft">
          {t("map.filters.timeOfDay")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIME_OPTIONS.map((time) => (
            <button
              key={time}
              onClick={() => toggleTime(time)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filters.timeOfDay.includes(time)
                  ? "border-ink bg-ink text-white"
                  : "border-line text-text-soft hover:border-ink/50"
              }`}
            >
              {t(`report.time.${time}` as const)}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-soft">
          {t("map.filters.category")}
        </div>
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                filters.categoryIds.includes(cat.id)
                  ? "bg-ink text-white"
                  : "text-text-soft hover:bg-paper"
              }`}
            >
              <CategoryIcon name={cat.icon} size={14} />
              {getCategoryLabel(cat.id, locale)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
