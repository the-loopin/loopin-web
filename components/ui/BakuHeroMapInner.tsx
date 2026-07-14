"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, MapPin, Sparkles } from "lucide-react";
import { EventCardItem } from "@/components/EventSlider/EventSlider";

interface EventPin {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  title: string;
  time: string;
  attendees: number;
  icon: string;
  category: string;
  type?: "EVENT" | "ACTIVITY";
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

type BakuHeroMapInnerProps = {
  opportunities?: EventCardItem[];
};

const formatPinTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Soon";

  return date.toLocaleString("en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PARTICLE_PRESETS = [
  { width: 4.2, height: 3.1, left: 12.5, top: 45.2, animY: -42, animX: 5, duration: 9.2 },
  { width: 3.5, height: 5.2, left: 78.1, top: 23.4, animY: -35, animX: -2, duration: 11.4 },
  { width: 2.1, height: 2.8, left: 34.7, top: 67.1, animY: -28, animX: 4, duration: 8.7 },
  { width: 5.4, height: 4.1, left: 56.2, top: 89.0, animY: -48, animX: -6, duration: 12.1 },
  { width: 3.9, height: 3.2, left: 89.4, top: 12.8, animY: -32, animX: 3, duration: 7.9 },
  { width: 4.8, height: 4.7, left: 21.0, top: 76.5, animY: -45, animX: -4, duration: 10.5 },
  { width: 2.9, height: 3.6, left: 63.8, top: 54.3, animY: -39, animX: 6, duration: 9.8 },
  { width: 5.1, height: 2.4, left: 45.3, top: 31.9, animY: -41, animX: -1, duration: 11.2 },
  { width: 3.2, height: 4.9, left: 91.7, top: 62.0, animY: -36, animX: 2, duration: 8.3 },
  { width: 4.5, height: 3.3, left: 8.3, top: 18.2, animY: -44, animX: -5, duration: 12.8 },
  { width: 2.6, height: 5.8, left: 71.9, top: 82.4, animY: -31, animX: 7, duration: 10.1 },
  { width: 3.8, height: 2.7, left: 52.1, top: 3.5, animY: -47, animX: -3, duration: 9.5 }
];

export default function BakuHeroMapInner({ opportunities = [] }: BakuHeroMapInnerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [pinPositions, setPinPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hoveredPin, setHoveredPin] = useState<EventPin | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapPins = useMemo(() => {
    const livePins = opportunities
      .filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number")
      .slice(0, 8)
      .map<EventPin>((item) => {
        const type = item.type === "ACTIVITY" ? "ACTIVITY" : "EVENT";

        return {
          id: String(item.id),
          name: item.address || item.city || "Baku",
          coordinates: [item.longitude as number, item.latitude as number],
          title: item.title,
          time: formatPinTime(item.startDateTime),
          attendees: item.interestsCount ?? 0,
          icon: type === "ACTIVITY" ? "Activity" : "Event",
          category: item.category || type,
          type,
        };
      });

    return livePins.length > 0 ? livePins : BakuEvents.map((pin, index) => ({
      ...pin,
      type: index % 2 === 0 ? "EVENT" as const : "ACTIVITY" as const,
    }));
  }, [opportunities]);

  const activePins = useMemo(() => {
    if (device === "mobile") {
      return mapPins.slice(0, 3);
    }
    if (device === "tablet") {
      return mapPins.slice(0, 5);
    }
    return mapPins;
  }, [device, mapPins]);

  const activeConnections = useMemo(() => {
    const activePinIds = activePins.map(p => p.id);
    return Connections.filter(
      conn => activePinIds.includes(conn.from) && activePinIds.includes(conn.to)
    );
  }, [activePins]);

  const activePinsRef = useRef(activePins);
  useEffect(() => {
    activePinsRef.current = activePins;
  }, [activePins]);

  const updateProjectedPositions = useCallback(() => {
    if (!mapRef.current) return;
    const positions: Record<string, { x: number; y: number }> = {};
    activePinsRef.current.forEach((pin) => {
      const proj = mapRef.current!.project(new maplibregl.LngLat(pin.coordinates[0], pin.coordinates[1]));
      positions[pin.id] = { x: proj.x, y: proj.y };
    });
    setPinPositions(positions);
  }, []);

  // Trigger update when activePins or mapLoaded changes
  useEffect(() => {
    if (mapLoaded) {
      updateProjectedPositions();
    }
  }, [activePins, mapLoaded, updateProjectedPositions]);

  // Resize listener to classify device type
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDevice("mobile");
      } else if (width < 1024) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Responsive initial settings
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
      scrollZoom: false, // Prevent interrupting page scroll
    });

    mapRef.current = map;

    map.on("load", () => {
      setMapLoaded(true);
      updateProjectedPositions();

      // Attempt building 3D extrusion on desktop/tablet
      if (device !== "mobile") {
        const style = map.getStyle();
        // Dynamically find vector tile source
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
                "#8b5cf6", // Glowing purple on hover
                "#1a152e"  // Default deep indigo dark building
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

    // Bind map events to sync overlays
    map.on("move", updateProjectedPositions);
    map.on("zoom", updateProjectedPositions);
    map.on("pitch", updateProjectedPositions);
    map.on("rotate", updateProjectedPositions);
    map.on("resize", updateProjectedPositions);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [device, updateProjectedPositions]);

  // Recalculate coordinates if device changes (which filters visible pins)
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // Trigger a map resize/move sync to update overlays
      mapRef.current.resize();
    }
  }, [device, mapLoaded]);

  // Mouse Parallax handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (device === "mobile" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    
    // Scale down movements for a subtle feel
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredPin(null);
  };

  // 3D Parallax Transform CSS
  const parallaxStyle = device !== "mobile" ? {
    transform: `perspective(1000px) rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 4}deg) translateX(${mousePos.x * 12}px) translateY(${mousePos.y * 12}px)`,
    transition: "transform 400ms cubic-bezier(0.25, 1, 0.5, 1)",
  } : {};

  const mapBorderColor = hoveredPin?.type === "ACTIVITY" ? "#ff7e15" : "#b66dff";
  const mapBorderGlow = hoveredPin?.type === "ACTIVITY"
    ? "rgba(255, 126, 21, 0.22)"
    : "rgba(182, 109, 255, 0.22)";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ clipPath: "inset(0 round 32px)" }}
      className="relative isolate w-full h-full flex items-center justify-center min-h-[420px] overflow-hidden rounded-[32px]"
    >
      {/* Background Glows & Particle Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px] -z-10">
        {/* Deep Ambient Glows */}
        <div className="absolute top-[10%] right-[10%] w-[250px] h-[250px] rounded-full bg-purple-600/10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[220px] h-[220px] rounded-full bg-cyan-500/10 blur-[80px]" />
        
        {/* Subtle Mesh Dust Particles */}
        {PARTICLE_PRESETS.map((p, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-purple-500/15"
            style={{
              width: `${p.width}px`,
              height: `${p.height}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
            animate={{
              y: [0, p.animY],
              x: [0, p.animX],
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Styled Glassmorphism Map Wrapper with Parallax */}
      <div
        style={{
          ...parallaxStyle,
          borderColor: mapBorderColor,
          boxShadow: `0 0 0 1px ${mapBorderColor}, 0 0 36px ${mapBorderGlow}`,
          clipPath: "inset(0 round 32px)",
        }}
        className="relative w-full h-full rounded-[32px] border-[7px] bg-black/20 overflow-hidden flex flex-col justify-end transition-[border-color,box-shadow] duration-300"
      >
        {/* Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden" />

        {/* Map Vignette Gradients */}
        <div className="absolute inset-0 pointer-events-none rounded-[32px] shadow-[inset_0_0_50px_rgba(0,0,0,0.85)]" />
        <div className="absolute inset-0 pointer-events-none rounded-[32px] bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* CSS styles for custom animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes dash-flow {
            to {
              stroke-dashoffset: -200;
            }
          }
          .connection-flow-line {
            animation: dash-flow 6s linear infinite;
          }
          @keyframes slow-pulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.6;
            }
            50% {
              transform: translate(-50%, -50%) scale(2.2);
              opacity: 0;
            }
          }
          .pulse-ring-element {
            animation: slow-pulse 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          }
        `}} />

        {/* Map Overlay Layer for Pins, Connection Lines, and Cards */}
        {mapLoaded && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
            {/* SVG Connection Network Overlay */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="purple-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              
              {activeConnections.map((conn, index) => {
                const fromPos = pinPositions[conn.from];
                const toPos = pinPositions[conn.to];
                if (!fromPos || !toPos) return null;

                // Compute smooth curved line details
                const dx = toPos.x - fromPos.x;
                const dy = toPos.y - fromPos.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const mx = (fromPos.x + toPos.x) / 2;
                const my = (fromPos.y + toPos.y) / 2;
                
                // Direction normal vector for curve bending
                const nx = -dy / len;
                const ny = dx / len;
                
                // Curve height based on distance
                const offset = Math.min(len * 0.16, 45);
                const cx = mx + nx * offset;
                const cy = my + ny * offset;

                const pathD = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`;

                return (
                  <g key={`${conn.from}-${conn.to}-${index}`}>
                    {/* Subtle stationary connecting line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(168, 85, 247, 0.15)"
                      strokeWidth="1.5"
                    />
                    {/* Animated glowing gradient flow line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#purple-cyan-grad)"
                      strokeWidth="2"
                      strokeDasharray="40 160"
                      strokeLinecap="round"
                      className="connection-flow-line"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Pins Overlay */}
            {activePins.map((pin) => {
              const pos = pinPositions[pin.id];
              if (!pos) return null;

              const isHovered = hoveredPin?.id === pin.id;
              const markerColor = pin.type === "ACTIVITY" ? "#ff7e15" : "#b66dff";
              const hoverColor = pin.type === "ACTIVITY" ? "#ffb15c" : "#d7b3ff";
              const pulseColor = pin.type === "ACTIVITY" ? "rgba(255, 126, 21, 0.36)" : "rgba(182, 109, 255, 0.4)";

              return (
                <div
                  key={pin.id}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="pointer-events-auto cursor-pointer group"
                  onMouseEnter={() => setHoveredPin(pin)}
                  onMouseLeave={() => setHoveredPin(null)}
                >
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    {/* Outer glowing pulse ring */}
                    <div
                      className="pulse-ring-element absolute top-1/2 left-1/2 w-7 h-7 rounded-full"
                      style={{ background: pulseColor }}
                    />
                    
                    {/* Soft ambient purple glow */}
                    <div
                      className="absolute w-5 h-5 rounded-full filter blur-[3px] transition-transform duration-300 group-hover:scale-150"
                      style={{ background: pulseColor }}
                    />

                    {/* Central marker point */}
                    <div 
                      className="relative w-3.5 h-3.5 rounded-full border border-white/60 shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: isHovered ? hoverColor : markerColor,
                        transform: isHovered ? "scale(1.25)" : undefined,
                        boxShadow: `0 0 22px ${pulseColor}`,
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Floating Glassmorphism Detail Card */}
            <AnimatePresence>
              {hoveredPin && pinPositions[hoveredPin.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="absolute pointer-events-none z-50 p-3.5 w-52 rounded-2xl border border-white/10 bg-black/75 backdrop-blur-md shadow-2xl flex flex-col gap-2"
                  style={{
                    left: pinPositions[hoveredPin.id].x,
                    top: pinPositions[hoveredPin.id].y - 18,
                    transform: "translate(-50%, -100%)",
                    borderColor: hoveredPin.type === "ACTIVITY" ? "rgba(255, 126, 21, 0.42)" : "rgba(182, 109, 255, 0.48)",
                  }}
                >
                  {/* Category tag */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-1"
                      style={{ color: hoveredPin.type === "ACTIVITY" ? "#ff9f4a" : "#c58cff" }}
                    >
                      <Sparkles size={8} /> {hoveredPin.type === "EVENT" ? "Event" : "Activity"} - {hoveredPin.category}
                    </span>
                    <span className="text-[9px] uppercase text-gray-400">{hoveredPin.icon}</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {hoveredPin.title}
                  </h4>

                  {/* Meta items */}
                  <div className="flex flex-col gap-1 text-[10px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} style={{ color: hoveredPin.type === "ACTIVITY" ? "#ff9f4a" : "#c58cff" }} />
                      <span>{hoveredPin.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={10} style={{ color: hoveredPin.type === "ACTIVITY" ? "#ff9f4a" : "#c58cff" }} />
                      <span>{hoveredPin.attendees} people joined</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} style={{ color: hoveredPin.type === "ACTIVITY" ? "#ff9f4a" : "#c58cff" }} />
                      <span className="truncate">{hoveredPin.name}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
