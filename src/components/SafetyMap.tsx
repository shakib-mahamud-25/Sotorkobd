"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";
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

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    const points = reports.map(
      (r) => [r.latitude, r.longitude, r.severity / 5] as [number, number, number]
    );
    // @ts-expect-error leaflet.heat extends L with heatLayer at runtime
    const heat = L.heatLayer(points, {
      radius: 28,
      blur: 22,
      maxZoom: 16,
      gradient: { 0.2: "#1D4E5F", 0.5: "#C9793E", 0.8: "#8A2E2E" },
    });
    heat.addTo(map);
    layerRef.current = heat;

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [reports, map]);

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
