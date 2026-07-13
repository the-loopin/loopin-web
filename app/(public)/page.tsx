"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteShell } from "../site";
import {
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { EventSlider, EventCardItem } from "@/components/EventSlider/EventSlider";
import BakuHeroMap from "@/components/ui/BakuHeroMap";

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

export default function PublicHomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <SiteShell>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-copy">

          {/* Eyebrow label */}
          <span className="eyebrow">
            <MapPin size={14} />
            City-wide social discovery · Baku
          </span>

          <h1>Find the plan, build the circle, arrive together.</h1>
          <p>
            Discover events, form groups, chat in real time, and keep every local moment organized — all in one place.
          </p>
          <div className="hero-actions">
            <Link
              href="/explore"
              className="primary-action relative overflow-hidden group !px-7 !py-3.5 !text-lg flex items-center justify-center transition-colors"
            >
              <span className="absolute inset-0 bg-[var(--violet)] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-0 motion-reduce:transition-colors motion-reduce:duration-0 motion-reduce:group-hover:bg-[var(--violet)]"></span>
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                Explore <ArrowUpRight size={20} />
              </span>
            </Link>
          </div>
        </div>

        {/* 3D Baku Map Visual */}
        <div className="hero-scene !bg-transparent !border-none !shadow-none !rounded-none !p-0 select-none">
          {mounted && <BakuHeroMap />}
        </div>
      </section>

      {/* Suggested Carousel Section */}
      <div className="my-12 lg:my-20 xl:my-28 2xl:my-36">
        <div className="flex justify-between items-center responsive-container mb-6">
          <div>
            <span className="text-xs text-[var(--color-coral)] font-bold tracking-widest uppercase">Suggestions</span>
            <h2 className="text-2xl font-extrabold text-[var(--color-ink)]">Suggested for your interests</h2>
          </div>
        </div>
        <EventSlider events={mockEvents} />
      </div>
    </SiteShell>
  );
}
