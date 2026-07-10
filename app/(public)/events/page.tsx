"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createEvent, EventItem, EventPayload, getEvents } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, Input, PageHeader, Panel, Select, SiteShell, Textarea } from "../../site";
import { MapPin, CalendarDays, Users, Layers, Tag, Plus, Filter, Sparkles } from "lucide-react";

const categories = ["TECH", "STARTUP", "HR", "EDUCATION", "TRAVEL", "SPORT", "SOCIAL", "LANGUAGE", "CREATIVE", "OTHER"];
const statuses = ["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"];

const initialForm: EventPayload = {
  title: "Baku Startup Hackathon",
  description: "Join the local hacker community to build projects and network with organizers.",
  type: "EVENT",
  category: "STARTUP",
  city: "Baku",
  address: "Idea Lab, Nizami Street",
  startDateTime: "2026-07-12T10:00:00",
  endDateTime: "2026-07-12T18:00:00",
  isFree: true,
  price: 0,
  organizerName: "Baku Hackers Club",
  imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  status: "PUBLISHED",
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState({ city: "Baku", category: "", search: "", isFree: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const data = await getEvents(filters);
      // Filter client-side to only show events of type EVENT
      const filtered = data.filter(e => e.type === "EVENT");
      setEvents(filtered);
      if (filtered.length > 0 && !selectedEventId) {
        setSelectedEventId(filtered[0].id);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.city, filters.isFree]); // auto-trigger on simple filters

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      // Ensure type is forced to EVENT
      const created = await createEvent({ ...form, type: "EVENT" });
      setEvents((current) => [created, ...current]);
      setSelectedEventId(created.id);
      setShowCreateForm(false);
      // Reset form title/desc for next use
      setForm({
        ...initialForm,
        title: "Baku Tech Meetup",
        category: "TECH",
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create event.");
    }
  }

  // Consistent coordinate mapper based on string hashing
  const getCoordsForEvent = (event: EventItem) => {
    let hash1 = 0;
    let hash2 = 0;
    const str = event.title + (event.address || "");
    for (let i = 0; i < str.length; i++) {
      hash1 = str.charCodeAt(i) + ((hash1 << 5) - hash1);
      hash2 = str.charCodeAt(i) * 31 + ((hash2 << 7) - hash2);
    }
    const x = 15 + Math.abs(hash1 % 70); // 15% to 85%
    const y = 15 + Math.abs(hash2 % 70); // 15% to 85%
    return { x, y };
  };

  return (
    <SiteShell>
      <PageHeader 
        title="Explore Events" 
        subtitle="Find planned gatherings, startup nights, and events organized in your city."
        action={
          <button 
            className="primary-button" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus size={16} /> Create Event
          </button>
        }
      />
      <ErrorMessage message={error} />

      {showCreateForm && (
        <div className="mb-8 p-6 bg-white/[0.03] border border-white/10 rounded-xl">
          <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-coral" />
            Host a New Event
          </h2>
          <form className="grid gap-3" onSubmit={handleCreate}>
            <Input label="Title" value={form.title} onChange={(title) => setForm((c) => ({ ...c, title }))} required />
            <Textarea label="Description" value={form.description} onChange={(description) => setForm((c) => ({ ...c, description }))} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Category" value={form.category} options={categories} onChange={(category) => setForm((c) => ({ ...c, category }))} />
              <Input label="City" value={form.city} onChange={(city) => setForm((c) => ({ ...c, city }))} required />
              <Input label="Address" value={form.address} onChange={(address) => setForm((c) => ({ ...c, address }))} />
              <Input label="Start" value={form.startDateTime} onChange={(startDateTime) => setForm((c) => ({ ...c, startDateTime }))} />
              <Input label="End" value={form.endDateTime} onChange={(endDateTime) => setForm((c) => ({ ...c, endDateTime }))} />
              <Input label="Organizer" value={form.organizerName} onChange={(organizerName) => setForm((c) => ({ ...c, organizerName }))} />
              <Select label="Status" value={form.status} options={statuses} onChange={(status) => setForm((c) => ({ ...c, status }))} />
            </div>
            <Input label="Image URL" value={form.imageUrl} onChange={(imageUrl) => setForm((c) => ({ ...c, imageUrl }))} />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input checked={form.isFree} onChange={(e) => setForm((c) => ({ ...c, isFree: e.target.checked, price: e.target.checked ? 0 : c.price }))} type="checkbox" />
              Free event
            </label>
            {!form.isFree ? <Input label="Price" value={String(form.price)} onChange={(price) => setForm((c) => ({ ...c, price: Number(price) }))} /> : null}
            <div className="flex gap-2 justify-end mt-4">
              <button className="secondary-button" type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button className="primary-button" type="submit">Publish Event</button>
            </div>
          </form>
        </div>
      )}

      {/* Category Selection Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
            filters.category === "" 
              ? "bg-accent border-accent text-black font-extrabold" 
              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
          }`}
          onClick={() => setFilters(c => ({ ...c, category: "" }))}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
              filters.category === cat 
                ? "bg-accent border-accent text-black font-extrabold" 
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
            onClick={() => setFilters(c => ({ ...c, category: cat }))}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="split-view-container">
        {/* Left Side: Events List */}
        <div className="flex flex-col gap-4">
          {/* Simple Search & Filter Row */}
          <div className="grid gap-3 sm:grid-cols-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <Input label="Search" value={filters.search} onChange={(search) => setFilters((c) => ({ ...c, search }))} />
            <Input label="City" value={filters.city} onChange={(city) => setFilters((c) => ({ ...c, city }))} />
            <Select label="Free" value={filters.isFree} options={["", "true", "false"]} onChange={(isFree) => setFilters((c) => ({ ...c, isFree }))} />
          </div>

          <div className="flex justify-end">
            <button className="small-action inline-flex items-center gap-1" onClick={loadEvents}>
              <Filter size={14} /> {loading ? "Syncing..." : "Apply Filters"}
            </button>
          </div>

          <div className="grid gap-4">
            {events.length ? events.map((event) => {
              const isSelected = selectedEventId === event.id;
              // Mock participants & groups
              const mockParticipants = Math.floor((event.id || 1) * 3.5) % 25 + 5;
              const mockGroupsCount = (event.id || 1) % 3 + 1;

              return (
                <article 
                  className={`event-card ${isSelected ? "event-card-active" : ""}`} 
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <div className="event-poster poster-violet">
                    <CalendarDays size={20} />
                    <span className="text-[10px] font-bold tracking-wider">{event.category}</span>
                  </div>
                  <div className="event-card-body">
                    <div>
                      <p className="text-xs text-coral font-bold">{new Date(event.startDateTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <h3 className="text-lg font-bold text-white mt-0.5">{event.title}</h3>
                    </div>
                    <div className="flex flex-col gap-1 my-2">
                      <div className="event-meta-row"><MapPin size={13} className="text-slate-500" /> {event.address || event.city}</div>
                      <div className="flex gap-4 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Users size={12} /> {mockParticipants} participants</span>
                        <span className="flex items-center gap-1"><Layers size={12} /> {mockGroupsCount} groups forming</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                      <span className="text-xs font-semibold">{event.isFree ? "Free" : `${event.price} AZN`}</span>
                      <Link className="text-xs text-accent font-bold hover:underline" href={`/events/${event.id}`}>
                        Open Event &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              );
            }) : <EmptyState>No planned events matched your filters.</EmptyState>}
          </div>
        </div>

        {/* Right Side: Interactive Map */}
        <div className="split-view-map">
          <div className="p-3 bg-surface border-b border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Baku Event Map</span>
            {selectedEventId && (
              <span className="text-xs text-accent font-semibold animate-pulse">Pin Highlighted</span>
            )}
          </div>
          <div className="relative w-full h-full bg-paper">
            <svg className="w-full h-full" style={{ minHeight: '400px' }}>
              <pattern id="gridPattern" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />
              
              {/* Baku contours representation */}
              <path d="M 50,200 C 150,150 250,300 450,200 S 650,100 850,250" fill="none" stroke="rgba(185,121,255,0.08)" strokeWidth="8" />
              <path d="M 100,100 C 300,300 500,50 700,200" fill="none" stroke="rgba(34,214,182,0.05)" strokeWidth="5" />

              {events.map((event) => {
                const { x, y } = getCoordsForEvent(event);
                const isSelected = selectedEventId === event.id;

                return (
                  <g 
                    key={event.id} 
                    transform={`translate(${x}%, ${y}%)`} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    {isSelected && (
                      <circle r="22" fill="var(--color-accent)" opacity="0.2" className="animate-ping" />
                    )}
                    <circle 
                      r={isSelected ? "9" : "6"} 
                      fill={isSelected ? "var(--color-accent)" : "var(--violet)"} 
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth="1.5"
                    />
                    <text 
                      y="-12" 
                      textAnchor="middle" 
                      fill={isSelected ? "var(--color-accent)" : "white"} 
                      fontSize={isSelected ? "11" : "9"} 
                      className="font-extrabold pointer-events-none" 
                      style={{ textShadow: '0 2px 4px black' }}
                    >
                      {event.title.length > 15 ? `${event.title.substring(0, 15)}...` : event.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

