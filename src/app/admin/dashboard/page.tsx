"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { getCategoryLabel } from "@/lib/categories";
import type { Report, ReportMedia } from "@/types";
import { LogOut, Check, EyeOff, Trash2, ImageIcon, AlertTriangle } from "lucide-react";

type TabKey = "flagged" | "published" | "hidden" | "removed";

export default function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("flagged");
  const [reports, setReports] = useState<Report[]>([]);
  const [media, setMedia] = useState<ReportMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

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
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "flagged", label: t("admin.dashboard.flagged") },
    { key: "published", label: t("admin.dashboard.published") },
    { key: "hidden", label: "Hidden" },
    { key: "removed", label: "Removed" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {t("admin.dashboard.title")}
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-text-soft hover:text-ink"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-line">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === tb.key
                ? "border-ink text-ink"
                : "border-transparent text-text-soft hover:text-ink"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-text-soft">Loading…</p>}
      {!loading && reports.length === 0 && (
        <p className="text-sm text-text-soft">No reports in this category.</p>
      )}

      <div className="space-y-3">
        {reports.map((report) => {
          const reportMedia = media.filter((m) => m.report_id === report.id);
          return (
            <div
              key={report.id}
              className="rounded-xl border border-line bg-paper-raised p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {getCategoryLabel(report.category_id, locale)}
                    </span>
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-text-soft">
                      Severity {report.severity}
                    </span>
                    {report.is_seed && (
                      <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-medium text-amber">
                        Seed data
                      </span>
                    )}
                    {report.flag_reason && (
                      <span className="flex items-center gap-1 rounded-full bg-brick/10 px-2 py-0.5 text-[10px] font-medium text-brick">
                        <AlertTriangle size={10} />
                        {report.flag_reason}
                      </span>
                    )}
                  </div>
                  {report.area_name && (
                    <div className="mt-1 text-xs text-text-soft">{report.area_name}</div>
                  )}
                  {report.description && (
                    <p className="mt-2 text-sm leading-relaxed text-text">
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
                          className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-line"
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
                  <div className="mt-2 text-[10px] text-text-soft">
                    {new Date(report.created_at).toLocaleString()} · fingerprint:{" "}
                    {report.submitter_fingerprint?.slice(0, 10) ?? "—"}…
                  </div>
                </div>

                <div className="flex flex-none flex-col gap-1.5">
                  {tab !== "published" && (
                    <button
                      onClick={() => updateStatus(report.id, "published")}
                      className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white"
                    >
                      <Check size={12} />
                      {t("admin.dashboard.approve")}
                    </button>
                  )}
                  {tab !== "hidden" && (
                    <button
                      onClick={() => updateStatus(report.id, "hidden")}
                      className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-text-soft"
                    >
                      <EyeOff size={12} />
                      {t("admin.dashboard.hide")}
                    </button>
                  )}
                  {tab !== "removed" && (
                    <button
                      onClick={() => updateStatus(report.id, "removed")}
                      className="flex items-center gap-1.5 rounded-full border border-brick/30 px-3 py-1.5 text-[11px] font-semibold text-brick"
                    >
                      <Trash2 size={12} />
                      {t("admin.dashboard.remove")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
