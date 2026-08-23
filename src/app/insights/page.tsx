"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { getCategoryLabel } from "@/lib/categories";
import type { StatsData } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

// "Lightweight Insights," per spec section 7 — explicitly NOT a BI
// dashboard. Every number here is one of the six things the spec names
// (reports over time, category, day vs night, top areas, severity
// distribution) and nothing more. No card-overload: this reads as an
// editorial page with a few clearly-labeled sections, not a grid of
// generic stat tiles.
//
// Every section carries a one-line contextual statement distinguishing
// "reports submitted by Sotorko users" from "official crime statistics" —
// per spec section 7 and section 10 (trust & language). This is not
// decorative copy; it's the thing that keeps this page honest.
export default function InsightsPage() {
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

  const numberFormat = (n: number) =>
    n.toLocaleString(locale === "bn" ? "bn-BD" : "en-US");

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <h1 className="text-display-sm text-[var(--color-primary)]">
        {t("insights.title")}
      </h1>

      {loading ? (
        <div className="mt-8 space-y-10">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : !stats ? (
        <p className="mt-6 text-sm text-[var(--color-text-secondary)]">
          {t("insights.error")}
        </p>
      ) : (
        <>
          {/* Headline number — editorial treatment per spec section 14:
              a large number with small contextual metadata beneath it,
              not a labeled card. */}
          <div className="mt-10">
            <div className="text-display-lg text-[var(--color-primary)]">
              {numberFormat(stats.realTotalReports)}
            </div>
            <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {t("insights.headline.label")}
            </div>
            <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {t("insights.headline.scope")}
            </div>
          </div>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t("insights.headline.context")}
          </p>

          {/* When are reports most common */}
          {stats.dayVsNight.day + stats.dayVsNight.night > 0 && (
            <Section title={t("insights.dayNight.title")}>
              <DayNightBar dayVsNight={stats.dayVsNight} t={t} />
            </Section>
          )}

          {/* What gets reported most */}
          {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
            <Section title={t("insights.categories.title")}>
              <CategoryList
                breakdown={stats.categoryBreakdown}
                locale={locale}
                total={stats.realTotalReports}
              />
            </Section>
          )}

          {/* Where reports are recurring */}
          {stats.allAreas && stats.allAreas.length > 0 && (
            <Section title={t("insights.areas.title")}>
              <AreaList areas={stats.allAreas} total={stats.realTotalReports} />
            </Section>
          )}

          {/* How reporting has changed */}
          {stats.weeklyTrend.length > 1 && (
            <Section title={t("insights.trend.title")}>
              <TrendSparkline data={stats.weeklyTrend} />
            </Section>
          )}

          <p className="mt-12 border-t border-[var(--color-border)] pt-6 text-xs leading-relaxed text-[var(--color-text-muted)]">
            {t("insights.disclaimer")}
          </p>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DayNightBar({
  dayVsNight,
  t,
}: {
  dayVsNight: { day: number; night: number };
  t: (key: TranslationKey) => string;
}) {
  const total = dayVsNight.day + dayVsNight.night;
  const dayPct = total > 0 ? Math.round((dayVsNight.day / total) * 100) : 0;
  const nightPct = 100 - dayPct;

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full bg-[var(--color-accent)]"
          style={{ width: `${dayPct}%` }}
        />
        <div
          className="h-full bg-[var(--color-primary)]"
          style={{ width: `${nightPct}%` }}
        />
      </div>
      <div className="mt-2.5 flex justify-between text-xs text-[var(--color-text-secondary)]">
        <span>
          {t("insights.dayNight.day")} · {dayPct}%
        </span>
        <span>
          {t("insights.dayNight.night")} · {nightPct}%
        </span>
      </div>
    </div>
  );
}

function CategoryList({
  breakdown,
  locale,
  total,
}: {
  breakdown: { category_id: string; count: number }[];
  locale: "en" | "bn";
  total: number;
}) {
  const top = breakdown.slice(0, 6);
  const max = top[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      {top.map((item) => (
        <div key={item.category_id}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-primary)]">
              {getCategoryLabel(item.category_id, locale)}
            </span>
            <span className="text-[var(--color-text-muted)]">
              {total > 0 ? Math.round((item.count / total) * 100) : 0}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-secondary)]"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AreaList({
  areas,
  total,
}: {
  areas: { area_name: string; count: number }[];
  total: number;
}) {
  return (
    <ol className="space-y-2.5">
      {areas.slice(0, 6).map((area, i) => (
        <li key={area.area_name} className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-primary)]">
            <span className="mr-2.5 text-[var(--color-text-muted)]">{i + 1}</span>
            {area.area_name}
          </span>
          <span className="text-[var(--color-text-muted)]">
            {area.count} · {total > 0 ? Math.round((area.count / total) * 100) : 0}%
          </span>
        </li>
      ))}
    </ol>
  );
}

function TrendSparkline({ data }: { data: { week: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex h-16 items-end gap-1.5">
      {data.map((d) => (
        <div
          key={d.week}
          className="flex-1 rounded-t-sm bg-[var(--color-secondary)]/70"
          style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
          title={`${d.week}: ${d.count}`}
        />
      ))}
    </div>
  );
}
