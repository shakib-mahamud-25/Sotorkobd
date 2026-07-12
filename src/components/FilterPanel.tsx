"use client";

import { useI18n } from "@/lib/i18n/context";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/lib/iconMap";
import type { MapFilters, TimeOfDay } from "@/types";
import { Map as MapIcon, Flame } from "lucide-react";

const DATE_RANGES: MapFilters["dateRange"][] = ["7d", "30d", "6m", "1y", "all"];
const TIME_OPTIONS: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] active:scale-95 ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-xs)]"
          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-hover-tint)]"
      }`}
    >
      {children}
    </button>
  );
}

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

  function toggleTime(time: TimeOfDay) {
    const next = filters.timeOfDay.includes(time)
      ? filters.timeOfDay.filter((x) => x !== time)
      : [...filters.timeOfDay, time];
    onChange({ ...filters, timeOfDay: next });
  }

  return (
    <div className="space-y-7">
      {/* View toggle */}
      <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-1">
        <button
          onClick={() => onViewModeChange("pins")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] ${
            viewMode === "pins"
              ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-xs)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          }`}
        >
          <MapIcon size={14} />
          {t("map.view.pins")}
        </button>
        <button
          onClick={() => onViewModeChange("heatmap")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] ${
            viewMode === "heatmap"
              ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-xs)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          }`}
        >
          <Flame size={14} />
          {t("map.view.heatmap")}
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
        {resultCount} {t("map.reportCount")}
      </div>

      {/* Date range */}
      <div>
        <div className="text-label mb-2.5 text-[var(--color-text-muted)]">
          {t("map.filters.dateRange")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DATE_RANGES.map((range) => (
            <FilterChip
              key={range}
              active={filters.dateRange === range}
              onClick={() => onChange({ ...filters, dateRange: range })}
            >
              {t(`map.filters.dateRange.${range}` as const)}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div>
        <div className="text-label mb-2.5 flex items-center justify-between text-[var(--color-text-muted)]">
          <span>{t("map.filters.severity")}</span>
          <span className="text-[var(--color-primary)]">{filters.severityMin}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={filters.severityMin}
          onChange={(e) =>
            onChange({ ...filters, severityMin: Number(e.target.value) })
          }
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border-strong)] accent-[var(--color-primary)]"
        />
      </div>

      {/* Time of day */}
      <div>
        <div className="text-label mb-2.5 text-[var(--color-text-muted)]">
          {t("map.filters.timeOfDay")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIME_OPTIONS.map((time) => (
            <FilterChip
              key={time}
              active={filters.timeOfDay.includes(time)}
              onClick={() => toggleTime(time)}
            >
              {t(`report.time.${time}` as const)}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="text-label mb-2.5 text-[var(--color-text-muted)]">
          {t("map.filters.category")}
        </div>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const active = filters.categoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                aria-pressed={active}
                className={`flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm font-medium transition-all duration-[var(--duration-base)] ${
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-tint)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <CategoryIcon name={cat.icon} size={15} />
                <span className="text-xs">{getCategoryLabel(cat.id, locale)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
