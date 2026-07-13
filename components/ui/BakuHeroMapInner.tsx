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

const Connections = [
  { from: "flametowers", to: "oldcity" },
  { from: "oldcity", to: "fountain" },
  { from: "fountain", to: "nizami" },
  { from: "nizami", to: "portbaku" },
  { from: "portbaku", to: "whitecity" },
  { from: "fountain", to: "portbaku" },
];

export default function BakuHeroMapInner() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [pinPositions, setPinPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hoveredPin, setHoveredPin] = useState<EventPin | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

  const getActivePins = () => {
    if (device === "mobile") {
      return BakuEvents.filter(pin => ["fountain", "oldcity", "flametowers"].includes(pin.id));
    }
    if (device === "tablet") {
      return BakuEvents.filter(pin => pin.id !== "whitecity");
    }
    return BakuEvents;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let initialZoom = 13.2;
    let initialPitch = 45;
    let initialBearing = -10;

    if (device === "mobile") {
      initialZoom = 12.4;
      initialPitch = 0;
      initialBearing = 0;
    } else if (device === "tablet") {
      initialZoom = 12.8;
      initialPitch = 25;
      initialBearing = -5;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [49.848, 40.370],
      zoom: initialZoom,
      pitch: initialPitch,
      bearing: initialBearing,
      attributionControl: false,
      dragRotate: device !== "mobile",
      touchZoomRotate: device !== "mobile",
      scrollZoom: false,
    });

    mapRef.current = map;

    const updateProjectedPositions = () => {
      if (!mapRef.current) return;
      const positions: Record<string, { x: number; y: number }> = {};
      const activePins = getActivePins();
      activePins.forEach((pin) => {
        const proj = mapRef.current!.project(new maplibregl.LngLat(pin.coordinates[0], pin.coordinates[1]));
        positions[pin.id] = { x: proj.x, y: proj.y };
      });
      setPinPositions(positions);
    };

    map.on("load", () => {
      setMapLoaded(true);
      updateProjectedPositions();

      if (device !== "mobile") {
        const style = map.getStyle();
        const vectorSource = Object.keys(style.sources).find(
          (name) => style.sources[name].type === "vector"
        ) || "carto";

        if (style.layers.every((layer) => layer.id !== "3d-buildings")) {
          map.addLayer({
            id: "3d-buildings",
            source: vectorSource,
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 13,
            paint: {
              "fill-extrusion-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                "#8b5cf6",
                "#1a152e"
              ],
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                13.5,
                0,
                14,
                ["coalesce", ["get", "render_height"], ["get", "height"], 25]
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                13.5,
                0,
                14,
                ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0]
              ],
              "fill-extrusion-opacity": 0.8
            }
          });
        }
      }
    });

    map.on("move", updateProjectedPositions);
    map.on("zoom", updateProjectedPositions);
    map.on("pitch", updateProjectedPositions);
    map.on("rotate", updateProjectedPositions);
    map.on("resize", updateProjectedPositions);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [device]);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      mapRef.current.resize();
    }
  }, [device, mapLoaded]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (device === "mobile" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredPin(null);
  };

  const parallaxStyle = device !== "mobile" ? {
    transform: `perspective(1000px) rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 4}deg) translateX(${mousePos.x * 12}px) translateY(${mousePos.y * 12}px)`,
    transition: "transform 400ms cubic-bezier(0.25, 1, 0.5, 1)",
  } : {};

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center p-4 min-h-[420px]"
    >
      <div ref={mapContainerRef} className="w-full h-full rounded-[32px] overflow-hidden" style={parallaxStyle} />
    </div>
  );
}
