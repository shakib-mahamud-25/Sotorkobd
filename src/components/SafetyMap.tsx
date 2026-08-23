"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { Report } from "@/types";
import { getCategoryLabel, getSeverityColor } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/context";
import { Check } from "lucide-react";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

const DHAKA_CENTER: [number, number] = [23.7808, 90.4];

// V2: pin clustering (spec section 8 — "sensible clustering"). At real
// report volume, dense areas would otherwise render as a pile of
// overlapping full-size markers with no way to tell how many reports are
// underneath. This function builds a custom cluster icon matching the
// existing severity color language rather than the library's default blue
// circle, so a cluster reads as "part of Sotorko" rather than a generic
// map-plugin artifact. Cluster color reflects the highest severity among
// its contained reports — the same "don't understate the worst thing
// nearby" logic individual pins already use via createSeverityIcon.
function createClusterIcon(cluster: { getChildCount: () => number; getAllChildMarkers: () => L.Marker[] }): L.DivIcon {
  const count = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();
  const maxSeverity = markers.reduce((max, m) => {
    const s = (m.options as { severity?: number }).severity ?? 1;
    return Math.max(max, s);
  }, 1);
  const color = getSeverityColor(maxSeverity);
  const size = count < 10 ? 34 : count < 30 ? 42 : 50;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};opacity:0.9;
        display:flex;align-items:center;justify-content:center;
        color:white;font-weight:600;font-size:${count < 100 ? 13 : 11}px;
        box-shadow:0 0 0 4px ${color}26, 0 2px 8px rgba(15,42,61,0.3);
        border:2px solid white;
      ">${count}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

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
    {/* V2 accessibility fix: a Leaflet canvas map has no meaningful
        semantics for a screen reader — there was previously no accessible
        name for this region at all, and no way for a non-visual user to
        know how many reports are currently shown. This doesn't attempt to
        make the map itself screen-reader-navigable (not realistically
        achievable for a Leaflet canvas), but gives the region a name and a
        live-updating count, consistent with the spec's "accessible map
        fallback" — a parallel text summary, not fake interactivity. */}
    <div
      role="region"
      aria-label={t("map.accessibleLabel")}
      className="h-full w-full"
    >
    <div aria-live="polite" className="sr-only">
      {t("map.accessibleCount").replace("{n}", String(reports.length))}
    </div>
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

      {viewMode === "pins" && (
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createSeverityIcon(report.severity)}
              // severity is read back by createClusterIcon (via
              // getAllChildMarkers()[i].options.severity) to color each
              // cluster by its worst contained report — Leaflet allows
              // arbitrary extra fields on marker options, this isn't a
              // hack specific to this library.
              // @ts-expect-error severity is a custom option, not part of Leaflet's MarkerOptions type
              severity={report.severity}
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
        </MarkerClusterGroup>
      )}
    </MapContainer>
    </div>
    <MapLegend viewMode={viewMode} />
    </>
  );
}



