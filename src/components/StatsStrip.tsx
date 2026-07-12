"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import type { StatsData } from "@/types";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function StatsStrip() {
  const { t, locale } = useI18n();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label={t("home.stats.total")}
        value={stats ? stats.totalReports.toLocaleString(locale === "bn" ? "bn-BD" : "en-US") : "0"}
        loading={loading}
        delay={0}
      />
      <StatCard
        label={t("home.stats.today")}
        value={stats ? stats.reportsToday.toLocaleString(locale === "bn" ? "bn-BD" : "en-US") : "0"}
        loading={loading}
        delay={60}
      />
      <StatCard
        label={t("home.stats.topArea")}
        value={stats?.topAreas?.[0]?.area_name ?? "—"}
        loading={loading}
        delay={120}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  delay,
}: {
  label: string;
  value: string;
  loading: boolean;
  delay: number;
}) {
  if (loading) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
        <Skeleton className="h-9 w-20" />
        <Skeleton className="mt-3 h-3.5 w-28" />
      </Card>
    );
  }

  return (
    <Card
      className="animate-fade-in-up transition-transform duration-[var(--duration-base)] hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-display-sm text-[var(--color-primary)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{label}</div>
    </Card>
  );
}
