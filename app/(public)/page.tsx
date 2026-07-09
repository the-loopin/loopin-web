"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteShell } from "../site";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Line, PerspectiveCamera, Text } from "@react-three/drei";
import { Group, Mesh } from "three";
import { 
  ArrowUpRight, 
  Sparkles, 
  Ticket, 
  Users, 
  ShieldCheck, 
  CalendarDays, 
  MapPin, 
  Maximize2, 
  X
} from "lucide-react";
import { EventSlider, EventCardItem } from "@/components/EventSlider/EventSlider";

// Mock suggested events matching backend JPA structure
const mockEvents: EventCardItem[] = [
  {
    id: 1,
    title: "Neon Startup Night",
    description: "Connect with local tech founders, angel investors, and engineers under neon lights. Pitch your startup, find co-founders, or meet mentors.",
    type: "EVENT",
    category: "TECH",
    city: "Baku",
    address: "Port Baku Mall, Floor 3",
    startDateTime: "2026-07-16T19:30:00",
    endDateTime: "2026-07-16T22:30:00",
    isFree: true,
    price: 0,
    organizerName: "Baku Tech Hub",
    imageUrl: undefined,
    interestsCount: 28,
    joinUrl: "/events",
    interests: ["AI", "Networking", "Startups"],
    coverVariant: "coverVariant1",
  },
  {
    id: 2,
    title: "Old City Photo Walk",
    description: "Capture the golden hour lighting within the historic walls of Old City Baku. Learn shadows, lighting, and composition techniques.",
    type: "ACTIVITY",
    category: "ART",
    city: "Baku",
    address: "Icherisheher Metro Station",
    startDateTime: "2026-07-17T17:00:00",
    endDateTime: "2026-07-17T19:30:00",
    isFree: false,
    price: 15,
    organizerName: "Creative Baku",
    imageUrl: undefined,
    interestsCount: 14,
    joinUrl: "/activities",
    interests: ["Photography", "Design", "Fine Art"],
    coverVariant: "coverVariant2",
  },
  {
    id: 3,
    title: "Sunset Board Games",
    description: "Unwind with tabletop classics and modern strategy board games with a view. Great environment to meet new friends.",
    type: "EVENT",
    category: "SOCIAL",
    city: "Baku",
    address: "Nizami Street Cafe Area",
    startDateTime: "2026-07-18T18:00:00",
    endDateTime: "2026-07-18T21:30:00",
    isFree: true,
    price: 0,
    organizerName: "Baku Boardgames Club",
    imageUrl: undefined,
    interestsCount: 35,
    joinUrl: "/events",
    interests: ["Board Games", "Coffee", "Networking"],
    coverVariant: "coverVariant3",
  },
  {
    id: 4,
    title: "Late Night Code Session",
    description: "Bring your laptop, grab a specialty coffee, and build side projects with peers. Share code, get feedback, and build together.",
    type: "ACTIVITY",
    category: "TECH",
    city: "Baku",
    address: "Matrix Coffee House",
    startDateTime: "2026-07-17T22:00:00",
    endDateTime: "2026-07-18T02:00:00",
    isFree: false,
    price: 5,
    organizerName: "Loopin Devs",
    imageUrl: undefined,
    interestsCount: 19,
    joinUrl: "/activities",
    interests: ["Coding", "Coffee", "Side Projects"],
    coverVariant: "coverVariant4",
  },
  {
    id: 5,
    title: "Baku Tech Meetup",
    description: "Deep dive into web development, cloud computing, and AI technologies. Includes two lightning talks and networking.",
    type: "EVENT",
    category: "TECH",
    city: "Baku",
    address: "Baku Idea Lab",
    startDateTime: "2026-07-19T15:00:00",
    endDateTime: "2026-07-19T18:00:00",
    isFree: true,
    price: 0,
    organizerName: "Tech Meetup Org",
    imageUrl: undefined,
    interestsCount: 52,
    joinUrl: "/events",
    interests: ["Web Dev", "Cloud", "AI"],
    coverVariant: "coverVariant5",
  },
  {
    id: 6,
    title: "Bicycle Ride Boulevard",
    description: "A scenic morning ride along the Caspian Sea coastline. Bike rentals are available at the site. Open to all fitness levels.",
    type: "ACTIVITY",
    category: "OUTDOOR",
    city: "Baku",
    address: "Baku Boulevard Clock Tower",
    startDateTime: "2026-07-18T09:00:00",
    endDateTime: "2026-07-18T11:30:00",
    isFree: true,
    price: 0,
    organizerName: "Active Baku",
    imageUrl: undefined,
    interestsCount: 22,
    joinUrl: "/activities",
    interests: ["Outdoor", "Cycling", "Active Lifestyle"],
    coverVariant: "coverVariant6",
  }
];

function CityScene() {
  const ringRef = useRef<Group>(null);
  const pinsRef = useRef<Group>(null);
  const pulseRef = useRef<Mesh>(null);

  const buildings = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        x: (index % 7) * 0.78 - 2.35,
        z: Math.floor(index / 7) * 0.72 - 1.15,
        h: 0.24 + ((index * 37) % 8) * 0.075,
        shade: index % 3,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.y = t * 0.18;
    if (pinsRef.current) pinsRef.current.position.y = Math.sin(t * 1.4) * 0.04;
    if (pulseRef.current) {
      const scale = 1 + Math.sin(t * 2.6) * 0.08;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[3.2, 3.0, 4.0]} fov={36} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 8, 5]} intensity={2} color="#fff4dc" />
      <pointLight position={[-3, 2, 2]} intensity={2.2} color="#b979ff" />
      <pointLight position={[2.5, 1.6, -2.5]} intensity={1.8} color="#ff9900" />
      <group rotation={[0, -0.48, 0]} position={[0, -0.18, 0]}>
        <mesh receiveShadow position={[0, -0.04, 0]}>
          <boxGeometry args={[6.5, 0.08, 3.9]} />
          <meshStandardMaterial color="#101014" roughness={0.78} metalness={0.12} />
        </mesh>

        <group ref={ringRef} position={[0.25, 0.08, 0.15]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.62, 0.018, 16, 96]} />
            <meshStandardMaterial color="#b979ff" emissive="#5b20a5" emissiveIntensity={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.16, 0.012, 12, 96]} />
            <meshStandardMaterial color="#ff9900" emissive="#7a3c00" emissiveIntensity={0.45} />
          </mesh>
        </group>

        {buildings.map((building, index) => (
          <Float key={index} speed={1.1 + (index % 4) * 0.2} floatIntensity={0.025} rotationIntensity={0.03}>
            <mesh position={[building.x, building.h / 2, building.z]} castShadow>
              <boxGeometry args={[0.34, building.h, 0.34]} />
              <meshStandardMaterial
                color={building.shade === 0 ? "#24212b" : building.shade === 1 ? "#1b2630" : "#2a2219"}
                roughness={0.56}
                metalness={0.2}
              />
            </mesh>
          </Float>
        ))}

        <group ref={pinsRef}>
          {[
            [-1.8, 0.8, -0.7, "#b979ff"],
            [0.25, 1.05, 0.58, "#ff9900"],
            [1.9, 0.72, -0.24, "#21d6b5"],
          ].map(([x, y, z, color], index) => (
            <group key={index} position={[x as number, y as number, z as number]}>
              <mesh>
                <sphereGeometry args={[0.14, 28, 28]} />
                <meshStandardMaterial color={color as string} emissive={color as string} emissiveIntensity={0.45} />
              </mesh>
              <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.09, 0.22, 24]} />
                <meshStandardMaterial color={color as string} emissive={color as string} emissiveIntensity={0.35} />
              </mesh>
            </group>
          ))}
        </group>

        <Line
          points={[
            [-1.8, 0.86, -0.7],
            [0.25, 1.1, 0.58],
            [1.9, 0.78, -0.24],
          ]}
          color="#d9b8ff"
          lineWidth={2}
          transparent
          opacity={0.72}
        />

        <mesh ref={pulseRef} position={[0.22, 0.14, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.59, 72]} />
          <meshStandardMaterial color="#ff9900" emissive="#ff9900" emissiveIntensity={0.42} transparent opacity={0.7} />
        </mesh>

        <Float speed={1.5} floatIntensity={0.08} rotationIntensity={0.04}>
          <Text position={[0.22, 1.25, 0.18]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle">
            live groups
          </Text>
        </Float>
      </group>
      <Environment preset="city" />
    </>
  );
}

export default function PublicHomePage() {
  const [mounted, setMounted] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SiteShell>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} /> Local events, better groups
          </div>
          <h1>Find the plan, build the circle, arrive together.</h1>
          <p>
            A product-first Loopin interface for discovering events, forming groups, chatting in real time, and keeping every local moment organized.
          </p>
          <div className="hero-actions">
            <button 
              className="primary-action" 
              onClick={() => setShowExploreModal(true)}
            >
              Explore <ArrowUpRight size={18} />
            </button>
            <Link href="/activities" className="secondary-action">
              View live activities
            </Link>
          </div>
          <div className="hero-metrics">
            <div className="metric-card">
              <div className="metric-icon"><Ticket size={18} /></div>
              <span>events this week</span>
              <strong>128</strong>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><Users size={18} /></div>
              <span>open groups</span>
              <strong>42</strong>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><ShieldCheck size={18} /></div>
              <span>reports resolved</span>
              <strong>96%</strong>
            </div>
          </div>
        </div>

        {/* 3D Map Component with expand button */}
        <div className="hero-scene relative" style={{ cursor: 'pointer' }}>
          <div 
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              zIndex: 10, 
              background: 'rgba(10, 9, 14, 0.8)', 
              borderRadius: '50%',
              padding: '10px',
              border: '1px solid var(--line)',
              color: 'white'
            }}
            onClick={(e) => { e.stopPropagation(); setIsMapExpanded(true); }}
            title="Expand Map"
          >
            <Maximize2 size={16} />
          </div>
          <div onClick={() => setIsMapExpanded(true)} style={{ width: '100%', height: '100%' }}>
            {mounted && (
              <Canvas shadows dpr={[1, 1.7]}>
                <CityScene />
              </Canvas>
            )}
          </div>
        </div>
      </section>

      {/* Suggested Carousel Section */}
      <div className="my-16">
        <div className="flex justify-between items-center width-min(1180px, calc(100% - 32px)) mx-auto px-4 mb-4">
          <div>
            <span className="text-xs text-orange-500 font-bold tracking-widest uppercase">Suggestions</span>
            <h2 className="text-2xl font-extrabold text-white">Suggested for your interests</h2>
          </div>
        </div>

        <EventSlider events={mockEvents} />
      </div>

      {/* Explore Selection Flow Modal */}
      {showExploreModal && (
        <div className="map-modal-overlay">
          <div className="relative max-w-lg w-full bg-[#0a090e] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <button 
              className="absolute top-4 right-4 icon-button"
              onClick={() => setShowExploreModal(false)}
            >
              <X size={18} />
            </button>
            <Sparkles size={32} className="mx-auto text-orange-500 mb-4 animate-pulse" />
            <h2 className="text-2xl font-extrabold text-white mb-2">Start Exploring</h2>
            <p className="text-sm text-slate-400 mb-8">
              Select what type of plan you are looking for today.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/events"
                onClick={() => setShowExploreModal(false)}
                className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-purple-950/10 transition group"
              >
                <div className="w-12 h-12 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
                  <Ticket size={22} />
                </div>
                <strong className="text-white block mb-1">Events</strong>
                <span className="text-xs text-slate-400">Planned, organized, and public gatherings.</span>
              </Link>
              <Link 
                href="/activities"
                onClick={() => setShowExploreModal(false)}
                className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-950/10 transition group"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
                  <Users size={22} />
                </div>
                <strong className="text-white block mb-1">Activities</strong>
                <span className="text-xs text-slate-400">Casual, spur-of-the-moment group meetups.</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Expanded 3D Map Modal */}
      {isMapExpanded && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a090e]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />
                  Expanded Loopin City Map View
                </h3>
                <p className="text-xs text-slate-400">View real-time event distributions across Baku</p>
              </div>
              <button 
                className="map-modal-close icon-button"
                onClick={() => setIsMapExpanded(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, position: 'relative', background: '#070609' }}>
              {mounted && (
                <Canvas shadows dpr={[1, 1.7]}>
                  <CityScene />
                </Canvas>
              )}
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
