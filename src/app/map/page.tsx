"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { FilterPanel } from "@/components/FilterPanel";
import { useI18n } from "@/lib/i18n/context";
import type { MapFilters, Report } from "@/types";
import { SlidersHorizontal, X, MapPinOff, Loader2 } from "lucide-react";

const SafetyMap = dynamic(
  () => import("@/components/SafetyMap").then((m) => m.SafetyMap),
  {
    ssr: false,
    loading: () => (
      <div className="skeleton h-full w-full rounded-none" />
    ),
  }
);

const DEFAULT_FILTERS: MapFilters = {
  categoryIds: [],
  severityMin: 1,
  timeOfDay: [],
  dateRange: "all",
};

export default function MapPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<"pins" | "heatmap">("pins");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.categoryIds.length) params.set("categories", filters.categoryIds.join(","));
    if (filters.severityMin > 1) params.set("severityMin", String(filters.severityMin));
    if (filters.timeOfDay.length) params.set("timeOfDay", filters.timeOfDay.join(","));
    if (filters.dateRange !== "all") params.set("dateRange", filters.dateRange);

    try {
      const res = await fetch(`/api/reports/list?${params.toString()}`);
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  async function handleConfirm(reportId: string) {
    await fetch("/api/reports/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, confirm_count: r.confirm_count + 1 } : r
      )
    );
  }

  return (
    <div className="flex min-h-[560px] flex-1 flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-80 min-h-0 flex-none overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:block">
        <h1 className="text-display-sm mb-6 text-[var(--color-primary)]">
          {t("map.title")}
        </h1>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={reports.length}
        />
      </aside>

      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 md:hidden">
        <h1 className="text-heading text-[var(--color-primary)]">{t("map.title")}</h1>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors active:scale-95"
        >
          <SlidersHorizontal size={14} />
          {t("map.filters")}
        </button>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-0 z-[1000] transition-opacity duration-[var(--duration-base)] md:hidden ${
          mobileFiltersOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-[var(--color-overlay)]"
          onClick={() => setMobileFiltersOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)] transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] ${
            mobileFiltersOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-heading text-[var(--color-primary)]">
              {t("map.filters")}
            </h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-tint)]"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            resultCount={reports.length}
          />
        </div>
      </div>

      {/* Map */}
      <div className="relative min-h-[420px] flex-1">
        {loading && (
          <div className="animate-fade-in absolute inset-x-0 top-3 z-[500] flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-xs font-medium text-white shadow-[var(--shadow-md)]">
              <Loader2 size={12} className="animate-spin" />
              Loading
            </div>
          </div>
        )}
        {!loading && reports.length === 0 && (
          <div className="animate-fade-in-up absolute inset-x-0 top-3 z-[500] flex justify-center px-4">
            <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] shadow-[var(--shadow-md)]">
              <MapPinOff size={14} className="text-[var(--color-text-muted)]" />
              {t("map.noResults")}
            </div>
          </div>
        )}
        <SafetyMap reports={reports} viewMode={viewMode} onConfirm={handleConfirm} />
      </div>
    </div>
  );
}
