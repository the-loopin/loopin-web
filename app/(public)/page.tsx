"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { SiteShell } from "../site";

import {
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { EventSlider, EventCardItem } from "@/components/EventSlider/EventSlider";
import BakuHeroMap from "@/components/ui/BakuHeroMap";
import { EventItem, getEvents } from "@/lib/api/loopin";

function normalizeOpportunity(item: EventItem): EventCardItem {
  const type = item.type?.toUpperCase() === "ACTIVITY" ? "ACTIVITY" : "EVENT";

  return {
    ...item,
    type,
    category: item.displayCategory || item.category,
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
    price: item.price ?? 0,
    imageUrl: item.imageUrl || undefined,
    interestsCount: item.loopedCount ?? 0,
    joinUrl: type === "ACTIVITY" ? "/activities" : "/events",
    interests: [item.displayCategory || item.category, item.city].filter(Boolean),
  };
}


export default function PublicHomePage() {
  const [mounted, setMounted] = useState(false);
  const [opportunities, setOpportunities] = useState<EventCardItem[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    let alive = true;

    getEvents()
      .then((items) => {
        if (!alive) return;
        setOpportunities(items.map(normalizeOpportunity));
      })
      .catch(() => {
        if (!alive) return;
        setOpportunities([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const counts = useMemo(() => {
    return opportunities.reduce(
      (total, item) => {
        if (item.type === "ACTIVITY") {
          total.activities += 1;
        } else {
          total.events += 1;
        }
        return total;
      },
      { events: 0, activities: 0 },
    );
  }, [opportunities]);

  return (
    <SiteShell>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">
            <MapPin size={14} />
            City-wide social discovery - Baku
          </span>

          <h1>Find the plan, build the circle, arrive together.</h1>
          <p>
            Discover events, form groups, chat in real time, and keep every local moment organized - all in one place.
          </p>

          <div className="hero-actions">
            <Link
              href="/explore"
              className="primary-action relative overflow-hidden group !px-7 !py-3.5 !text-lg flex items-center justify-center transition-colors"
            >
              <span className="absolute inset-0 bg-[var(--violet)] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-0 motion-reduce:transition-colors motion-reduce:duration-0 motion-reduce:group-hover:bg-[var(--violet)]" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                Explore <ArrowUpRight size={20} />
              </span>
            </Link>
          </div>

          <div className="home-live-counts" aria-label="Loopin live opportunity counts">
            <Link href="/events" className="home-live-count home-live-count-events">
              <span>{counts.events}</span>
              <strong>Events</strong>
            </Link>
            <Link href="/activities" className="home-live-count home-live-count-activities">
              <span>{counts.activities}</span>
              <strong>Activities</strong>
            </Link>
          </div>
        </div>

        <div className="hero-scene !bg-transparent !border-none !shadow-none !rounded-none !p-0 select-none">
          {mounted && <BakuHeroMap opportunities={opportunities} />}
        </div>
      </section>

      <section className="home-opportunities-section">
        <div className="home-opportunities-heading responsive-container">
          <span>Live around Baku</span>
          <h2>Explore the latest events and activities</h2>
        </div>
        <EventSlider events={opportunities} />
      </section>
    </SiteShell>
  );
}
