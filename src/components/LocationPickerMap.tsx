"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

// Fix default marker icon paths (Leaflet's default assets don't resolve
// correctly under Next.js bundling without this).
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DHAKA_CENTER: [number, number] = [23.7808, 90.4],  // roughly centered on Dhaka
  DEFAULT_ZOOM = 12;

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPickerMap({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  );

  function handlePick(lat: number, lng: number) {
    setPosition([lat, lng]);
    onChange(lat, lng);
  }

  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border border-line">
      <MapContainer
        center={position ?? DHAKA_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        className="dusk-tiles"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickHandler onPick={handlePick} />
        {position && <Marker position={position} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
