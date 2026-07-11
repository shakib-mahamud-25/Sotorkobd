"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { DHAKA_AREAS } from "@/lib/dhakaAreas";
import { Locate, MapPinned, ChevronDown } from "lucide-react";
import type { LocationPrecision } from "@/types";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap").then((m) => m.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-paper" /> }
);

export interface LocationValue {
  latitude: number;
  longitude: number;
  area_name?: string;
  location_precision: LocationPrecision;
}

export function LocationStep({
  value,
  onChange,
}: {
  value: LocationValue | null;
  onChange: (v: LocationValue) => void;
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"gps" | "map" | "dropdown">("dropdown");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "denied" | "granted">("idle");

  function requestGps() {
    setGpsStatus("requesting");
    setMode("gps");
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsStatus("granted");
        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location_precision: "exact",
        });
      },
      () => {
        setGpsStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleMapPick(lat: number, lng: number) {
    onChange({
      latitude: lat,
      longitude: lng,
      location_precision: "approximate",
    });
  }

  function handleAreaSelect(areaName: string) {
    const area = DHAKA_AREAS.find((a) => a.name === areaName);
    if (!area) return;
    onChange({
      latitude: area.latitude,
      longitude: area.longitude,
      area_name: area.name,
      location_precision: "approximate",
    });
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-semibold text-ink">
        {t("report.location.title")}
      </h2>

      {/* GPS option */}
      <button
        type="button"
        onClick={requestGps}
        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
          mode === "gps" && gpsStatus === "granted"
            ? "border-ink bg-ink text-white"
            : "border-line bg-paper-raised hover:border-ink"
        }`}
      >
        <Locate size={20} />
        <div className="flex-1">
          <div className="text-sm font-semibold">{t("report.location.useGps")}</div>
          {mode === "gps" && gpsStatus === "requesting" && (
            <div className="text-xs opacity-70">…</div>
          )}
          {mode === "gps" && gpsStatus === "denied" && (
            <div className="text-xs text-brick">
              Permission denied — try the map or dropdown below.
            </div>
          )}
        </div>
      </button>
      <p className="-mt-2 text-xs text-text-soft">{t("report.location.useGpsHint")}</p>

      {/* Manual map pin */}
      <div>
        <button
          type="button"
          onClick={() => setMode("map")}
          className="flex items-center gap-2 text-sm font-medium text-ink"
        >
          <MapPinned size={16} />
          {t("report.location.pinManually")}
        </button>
        {mode === "map" && (
          <div className="mt-3">
            <LocationPickerMap
              value={
                value && mode === "map"
                  ? { lat: value.latitude, lng: value.longitude }
                  : null
              }
              onChange={handleMapPick}
            />
          </div>
        )}
      </div>

      {/* Dropdown */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <ChevronDown size={16} />
          {t("report.location.selectArea")}
        </label>
        <select
          className="mt-2 w-full rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm focus:border-ink"
          onChange={(e) => handleAreaSelect(e.target.value)}
          value={mode === "dropdown" && value?.area_name ? value.area_name : ""}
          onFocus={() => setMode("dropdown")}
        >
          <option value="" disabled>
            {t("report.location.selectArea")}
          </option>
          {DHAKA_AREAS.map((area) => (
            <option key={area.name} value={area.name}>
              {area.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
