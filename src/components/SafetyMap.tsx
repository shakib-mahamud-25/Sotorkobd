"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { Report } from "@/types";
import { getCategoryLabel, getSeverityColor } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/context";
import { Check } from "lucide-react";

const DHAKA_CENTER: [number, number] = [23.7808, 90.4];

function createSeverityIcon(severity: number): L.DivIcon {
  const color = getSeverityColor(severity);
  const size = 14 + severity * 2;
  const pulse = severity >= 4;
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${
          pulse
            ? `<div style="
                position:absolute;inset:-6px;border-radius:50%;
                background:${color};opacity:0.25;
                animation:sotorko-pulse 2.2s ease-out infinite;
              "></div>`
            : ""
        }
        <div style="
          position:relative;width:100%;height:100%;border-radius:50%;
          background:${color};opacity:0.92;
          box-shadow:0 0 0 4px ${color}26, 0 2px 6px rgba(15,42,61,0.28);
          border:2px solid white;
        "></div>
      </div>
      <style>
        @keyframes sotorko-pulse {
          0% { transform: scale(0.6); opacity: 0.35; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function HeatLayer({ reports }: { reports: Report[] }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);
  const [heatReady, setHeatReady] = useState(false);

  // leaflet.heat attaches L.heatLayer as a side effect and expects `L` to
  // already exist on window when it runs. Importing it at module load time
  // can race against Leaflet's own initialization under Next.js's bundler,
  // which silently no-ops instead of erroring — so we import it here,
  // inside an effect, after we know Leaflet + the map are mounted.
  useEffect(() => {
    let cancelled = false;
    (window as unknown as { L: typeof L }).L = L; // leaflet.heat reads window.L
    import("leaflet.heat").then(() => {
      if (!cancelled) setHeatReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!heatReady) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (reports.length === 0) return;

    const points = reports.map(
      (r) => [r.latitude, r.longitude, 0.4 + (r.severity / 5) * 0.6] as [number, number, number]
    );

    // @ts-expect-error leaflet.heat extends L with heatLayer at runtime
    const heat = L.heatLayer(points, {
      radius: 32,
      blur: 24,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.35,
      gradient: {
        0.1: "#1D4E5F", // calm teal — low intensity
        0.35: "#3D7A6E",
        0.55: "#C9793E", // amber — moderate
        0.75: "#D9622E",
        1.0: "#8A2E2E", // brick red — high intensity
      },
    });
    heat.addTo(map);
    layerRef.current = heat;

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [reports, map, heatReady]);

  return null;
}

function MapLegend({ viewMode }: { viewMode: "pins" | "heatmap" }) {
  const { t } = useI18n();
  const items: { color: string; labelKey: "map.legend.low" | "map.legend.moderate" | "map.legend.high" }[] = [
    { color: "#1D4E5F", labelKey: "map.legend.low" },
    { color: "#C9793E", labelKey: "map.legend.moderate" },
    { color: "#8A2E2E", labelKey: "map.legend.high" },
  ];

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-[500]">
      <div className="pointer-events-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3.5 py-3 shadow-[var(--shadow-md)] backdrop-blur-sm">
        <div className="text-label text-[var(--color-text-muted)]">{t("map.legend.title")}</div>
        <div className="mt-2 flex items-center gap-3">
          {items.map((item) => (
            <div key={item.labelKey} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 flex-none rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                {t(item.labelKey)}
              </span>
            </div>
          ))}
        </div>
        {viewMode === "pins" && (
          <div className="mt-1.5 text-[10px] text-[var(--color-text-muted)]">
            {t("map.legend.pulseHint")}
          </div>
        )}
      </div>
    </div>
  );
}

export function SafetyMap({
  reports,
  viewMode,
  onConfirm,
}: {
  reports: Report[];
  viewMode: "pins" | "heatmap";
  onConfirm: (reportId: string) => void;
}) {
  const { t, locale } = useI18n();
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  function handleConfirm(reportId: string) {
    onConfirm(reportId);
    setConfirmedIds((prev) => new Set(prev).add(reportId));
  }

  return (
    <>
    <MapContainer
      center={DHAKA_CENTER}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      className="dusk-tiles"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {viewMode === "heatmap" && <HeatLayer reports={reports} />}

      {viewMode === "pins" &&
        reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createSeverityIcon(report.severity)}
          >
            <Popup minWidth={220} maxWidth={280}>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 flex-none rounded-full"
                    style={{ backgroundColor: getSeverityColor(report.severity) }}
                  />
                  <div className="text-sm font-semibold text-[var(--color-primary)]">
                    {getCategoryLabel(report.category_id, locale)}
                  </div>
                </div>
                {report.area_name && (
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {report.area_name}
                  </div>
                )}
                {report.description && (
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {report.description}
                  </p>
                )}
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2.5">
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleConfirm(report.id)}
                    disabled={confirmedIds.has(report.id)}
                    className="flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-semibold text-white transition-all duration-[var(--duration-base)] hover:bg-[var(--color-primary-hover)] active:scale-95 disabled:opacity-70"
                  >
                    {confirmedIds.has(report.id) ? (
                      <>
                        <Check size={10} strokeWidth={3} />
                        {t("map.thanksConfirm")}
                      </>
                    ) : (
                      <>
                        {t("map.confirm")} ({report.confirm_count})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
    <MapLegend viewMode={viewMode} />
    </>
  );
}
