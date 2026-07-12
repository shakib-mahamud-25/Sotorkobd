"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { getCategoryLabel } from "@/lib/categories";
import type { Report, ReportMedia } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import {
  LogOut,
  Check,
  EyeOff,
  Trash2,
  AlertTriangle,
  Inbox,
} from "lucide-react";

type TabKey = "flagged" | "published" | "hidden" | "removed";

export default function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("flagged");
  const [reports, setReports] = useState<Report[]>([]);
  const [media, setMedia] = useState<ReportMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reports?status=${tab}`);
    if (res.status === 401) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setReports(data.reports ?? []);
    setMedia(data.media ?? []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (unauthorized) router.push("/admin");
  }, [unauthorized, router]);

  async function updateStatus(id: string, status: TabKey) {
    setActioningId(id);
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReports((prev) => prev.filter((r) => r.id !== id));
    setActioningId(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "flagged", label: t("admin.dashboard.flagged") },
    { key: "published", label: t("admin.dashboard.published") },
    { key: "hidden", label: t("admin.dashboard.hidden") },
    { key: "removed", label: t("admin.dashboard.removed") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-display-sm text-[var(--color-primary)]">
          {t("admin.dashboard.title")}
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          <LogOut size={13} />
          {t("admin.dashboard.logout")}
        </button>
      </div>

      <div className="mb-6 flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-[var(--duration-base)] ${
              tab === tb.key
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            }`}
          >
            {tb.label}
            {tab === tb.key && (
              <span className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-[var(--color-primary)]" />
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} padding="md">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <SkeletonText lines={2} />
                </div>
                <div className="flex flex-none flex-col gap-1.5">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]">
            <Inbox size={20} />
          </div>
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            {t("admin.dashboard.empty")}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {!loading &&
          reports.map((report, i) => {
            const reportMedia = media.filter((m) => m.report_id === report.id);
            const isActioning = actioningId === report.id;
            return (
              <Card
                key={report.id}
                padding="md"
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
              >
                <div className={`flex items-start justify-between gap-4 transition-opacity duration-[var(--duration-base)] ${isActioning ? "opacity-40" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-[var(--color-primary)]">
                        {getCategoryLabel(report.category_id, locale)}
                      </span>
                      <Badge tone="neutral">Severity {report.severity}</Badge>
                      {report.is_seed && <Badge tone="accent">Seed data</Badge>}
                      {report.flag_reason && (
                        <Badge tone="danger" icon={<AlertTriangle size={10} />}>
                          {report.flag_reason}
                        </Badge>
                      )}
                    </div>
                    {report.area_name && (
                      <div className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                        {report.area_name}
                      </div>
                    )}
                    {report.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-primary)]">
                        {report.description}
                      </p>
                    )}
                    {reportMedia.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {reportMedia.map((m) => (
                          <a
                            key={m.id}
                            href={m.cloudinary_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] transition-transform hover:scale-105"
                          >
                            <img
                              src={m.cloudinary_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="mt-2.5 text-[10px] text-[var(--color-text-muted)]">
                      {new Date(report.created_at).toLocaleString()} · fingerprint:{" "}
                      {report.submitter_fingerprint?.slice(0, 10) ?? "—"}…
                    </div>
                  </div>

                  <div className="flex flex-none flex-col gap-1.5">
                    {tab !== "published" && (
                      <button
                        onClick={() => updateStatus(report.id, "published")}
                        disabled={isActioning}
                        className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-semibold text-white transition-all duration-[var(--duration-base)] hover:bg-[var(--color-primary-hover)] active:scale-95 disabled:opacity-50"
                      >
                        <Check size={12} />
                        {t("admin.dashboard.approve")}
                      </button>
                    )}
                    {tab !== "hidden" && (
                      <button
                        onClick={() => updateStatus(report.id, "hidden")}
                        disabled={isActioning}
                        className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)] transition-all duration-[var(--duration-base)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-95 disabled:opacity-50"
                      >
                        <EyeOff size={12} />
                        {t("admin.dashboard.hide")}
                      </button>
                    )}
                    {tab !== "removed" && (
                      <button
                        onClick={() => updateStatus(report.id, "removed")}
                        disabled={isActioning}
                        className="flex items-center gap-1.5 rounded-full border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-danger)] transition-all duration-[var(--duration-base)] hover:bg-[var(--color-danger)] hover:text-white active:scale-95 disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        {t("admin.dashboard.remove")}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
