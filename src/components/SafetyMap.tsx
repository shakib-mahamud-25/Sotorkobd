"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { Report } from "@/types";
import { getCategoryLabel, getSeverityColor } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/context";

const DHAKA_CENTER: [number, number] = [23.7808, 90.4];

function createSeverityIcon(severity: number): L.DivIcon {
  const color = getSeverityColor(severity);
  const size = 14 + severity * 2;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};opacity:0.85;
      box-shadow:0 0 0 4px ${color}33, 0 2px 6px rgba(0,0,0,0.25);
      border:2px solid white;
    "></div>`,
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

  return (
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
            <Popup>
              <div className="min-w-[200px] space-y-2">
                <div className="text-sm font-semibold text-ink">
                  {getCategoryLabel(report.category_id, locale)}
                </div>
                {report.area_name && (
                  <div className="text-xs text-text-soft">{report.area_name}</div>
                )}
                {report.description && (
                  <p className="text-xs leading-relaxed text-text">
                    {report.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-text-soft">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onConfirm(report.id)}
                    className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold text-white"
                  >
                    {t("map.confirm")} ({report.confirm_count})
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
