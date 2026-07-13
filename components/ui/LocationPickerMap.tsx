"use client";

import { useEffect, useRef } from "react";
import type { CircleMarker, LeafletMouseEvent, Map as LeafletMap } from "leaflet";

type LocationPickerMapProps = {
  latitude: number;
  longitude: number;
  label: string;
  onChange: (latitude: number, longitude: number) => void;
};

export default function LocationPickerMap({ latitude, longitude, label, onChange }: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let isMounted = true;

    async function createMap() {
      if (!containerRef.current || mapRef.current) return;

      const L = await import("leaflet");
      if (!isMounted || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        minZoom: 11,
        maxZoom: 19,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "",
      }).addTo(map);

      const marker = L.circleMarker([latitude, longitude], {
        radius: 9,
        color: "#ffffff",
        weight: 2,
        fillColor: "#b970ff",
        fillOpacity: 1,
      }).addTo(map);

      map.on("click", (event: LeafletMouseEvent) => {
        const nextLatitude = Number(event.latlng.lat.toFixed(6));
        const nextLongitude = Number(event.latlng.lng.toFixed(6));
        marker.setLatLng([nextLatitude, nextLongitude]);
        onChangeRef.current(nextLatitude, nextLongitude);
      });

      mapRef.current = map;
      markerRef.current = marker;
      window.setTimeout(() => map.invalidateSize(), 0);
    }

    void createMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const current = markerRef.current.getLatLng();
    if (Math.abs(current.lat - latitude) < 0.000001 && Math.abs(current.lng - longitude) < 0.000001) {
      return;
    }

    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.setView([latitude, longitude], Math.max(mapRef.current.getZoom(), 16), { animate: true });
    window.setTimeout(() => mapRef.current?.invalidateSize(), 0);
  }, [latitude, longitude]);

  return <div ref={containerRef} className="location-picker-leaflet" role="application" aria-label={label} />;
}
