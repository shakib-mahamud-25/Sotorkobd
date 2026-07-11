"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { FilterPanel } from "@/components/FilterPanel";
import { useI18n } from "@/lib/i18n/context";
import type { MapFilters, Report } from "@/types";
import { SlidersHorizontal, X } from "lucide-react";

const SafetyMap = dynamic(
  () => import("@/components/SafetyMap").then((m) => m.SafetyMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-paper" /> }
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
    <div className="flex h-[calc(100vh-73px)] flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-80 flex-none overflow-y-auto border-r border-line bg-paper-raised p-6 md:block">
        <h1 className="font-display mb-5 text-xl font-semibold text-ink">
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
      <div className="flex items-center justify-between border-b border-line bg-paper-raised px-5 py-3 md:hidden">
        <h1 className="font-display text-lg font-semibold text-ink">{t("map.title")}</h1>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold"
        >
          <SlidersHorizontal size={14} />
          {t("map.filters")}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/40 md:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-paper-raised p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">
                {t("map.filters")}
              </h2>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X size={20} />
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
      )}

      {/* Map */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-x-0 top-0 z-[500] flex justify-center pt-3">
            <div className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-white">
              Loading…
            </div>
          </div>
        )}
        {!loading && reports.length === 0 && (
          <div className="absolute inset-x-0 top-0 z-[500] flex justify-center pt-3">
            <div className="rounded-full bg-paper-raised px-4 py-1.5 text-xs font-medium text-text-soft shadow">
              {t("map.noResults")}
            </div>
          </div>
        )}
        <SafetyMap reports={reports} viewMode={viewMode} onConfirm={handleConfirm} />
      </div>
    </div>
  );
}
