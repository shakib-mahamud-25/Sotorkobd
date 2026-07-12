"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { DHAKA_AREAS } from "@/lib/dhakaAreas";
import { Select } from "@/components/ui/Input";
import { Locate, MapPinned, ChevronDown, Check, LoaderCircle } from "lucide-react";
import type { LocationPrecision } from "@/types";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => <div className="skeleton h-72 w-full rounded-[var(--radius-lg)]" />,
  }
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
    setMode("map");
    onChange({
      latitude: lat,
      longitude: lng,
      location_precision: "approximate",
    });
  }

  function handleAreaSelect(areaName: string) {
    const area = DHAKA_AREAS.find((a) => a.name === areaName);
    if (!area) return;
    setMode("dropdown");
    onChange({
      latitude: area.latitude,
      longitude: area.longitude,
      area_name: area.name,
      location_precision: "approximate",
    });
  }

  const gpsSelected = mode === "gps" && gpsStatus === "granted";

  return (
    <div className="animate-fade-in space-y-5">
      <h2 className="text-heading text-[var(--color-primary)]">
        {t("report.location.title")}
      </h2>

      {/* GPS option */}
      <div>
        <button
          type="button"
          onClick={requestGps}
          className={`flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5 text-left transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] ${
            gpsSelected
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-hover-tint)]"
          }`}
        >
          {gpsStatus === "requesting" ? (
            <LoaderCircle size={20} className="flex-none animate-spin" />
          ) : gpsSelected ? (
            <Check size={20} className="flex-none" />
          ) : (
            <Locate size={20} className="flex-none" />
          )}
          <div className="flex-1">
            <div className="text-sm font-semibold">{t("report.location.useGps")}</div>
            {mode === "gps" && gpsStatus === "denied" && (
              <div className="mt-0.5 text-xs text-[var(--color-danger)]">
                Permission denied — try the map or dropdown below.
              </div>
            )}
          </div>
        </button>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
          {t("report.location.useGpsHint")}
        </p>
      </div>

      {/* Manual map pin */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
          <MapPinned size={16} />
          {t("report.location.pinManually")}
        </label>
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
      </div>

      {/* Dropdown */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
          <ChevronDown size={16} />
          {t("report.location.selectArea")}
        </label>
        <Select
          className="mt-3"
          onChange={(e) => handleAreaSelect(e.target.value)}
          value={mode === "dropdown" && value?.area_name ? value.area_name : ""}
        >
          <option value="" disabled>
            {t("report.location.selectArea")}
          </option>
          {DHAKA_AREAS.map((area) => (
            <option key={area.name} value={area.name}>
              {area.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
