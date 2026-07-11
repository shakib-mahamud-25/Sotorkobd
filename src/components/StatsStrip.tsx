"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import type { StatsData } from "@/types";

export function StatsStrip() {
  const { t, locale } = useI18n();
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label={t("home.stats.total")}
        value={stats ? stats.totalReports.toLocaleString(locale === "bn" ? "bn-BD" : "en-US") : "—"}
      />
      <StatCard
        label={t("home.stats.today")}
        value={stats ? stats.reportsToday.toLocaleString(locale === "bn" ? "bn-BD" : "en-US") : "—"}
      />
      <StatCard
        label={t("home.stats.topArea")}
        value={stats?.topAreas?.[0]?.area_name ?? "—"}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised px-6 py-5">
      <div className="font-display text-3xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-sm text-text-soft">{label}</div>
    </div>
  );
}
