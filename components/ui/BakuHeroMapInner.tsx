"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Calendar, Users, MapPin, Sparkles } from "lucide-react";

interface EventPin {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  title: string;
  time: string;
  attendees: number;
  icon: string;
  category: string;
}

const BakuEvents: EventPin[] = [
  {
    id: "fountain",
    name: "Fountain Square",
    coordinates: [49.8373, 40.3725],
    title: "Coffee Meetup",
    time: "Today • 18:00",
    attendees: 18,
    icon: "☕",
    category: "SOCIAL",
  },
  {
    id: "nizami",
    name: "Nizami Street",
    coordinates: [49.8385, 40.3708],
    title: "Sunset Board Games",
    time: "Tomorrow • 19:00",
    attendees: 35,
    icon: "🎲",
    category: "SOCIAL",
  },
  {
    id: "oldcity",
    name: "İçərişəhər",
    coordinates: [49.8354, 40.3662],
    title: "Old City Photo Walk",
    time: "Friday • 17:00",
    attendees: 14,
    icon: "📷",
    category: "ART",
  },
  {
    id: "whitecity",
    name: "White City",
    coordinates: [49.8822, 40.3831],
    title: "Art & Wine Evening",
    time: "Saturday • 20:00",
    attendees: 24,
    icon: "🍷",
    category: "ART",
  },
  {
    id: "portbaku",
    name: "Port Baku",
    coordinates: [49.8550, 40.3776],
    title: "Neon Startup Night",
    time: "Thursday • 19:30",
    attendees: 28,
    icon: "⚡",
    category: "TECH",
  },
  {
    id: "flametowers",
    name: "Flame Towers",
    coordinates: [49.8267, 40.3596],
    title: "Tech Summit Mixer",
    time: "Sunday • 18:30",
    attendees: 52,
    icon: "🔥",
    category: "TECH",
  },
];

export default function BakuHeroMapInner() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setDevice("mobile");
      else if (width < 1024) setDevice("tablet");
      else setDevice("desktop");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [49.848, 40.370],
      zoom: 13.2,
      attributionControl: false,
      scrollZoom: false,
    });

    mapRef.current = map;
    map.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
