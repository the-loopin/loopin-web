"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createEvent, EventItem, EventPayload, getEvents } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, Input, PageHeader, Panel, Select, SiteShell, Textarea } from "../../site";
import { MapPin, CalendarDays, Users, Layers, Tag, Plus, Filter, Sparkles } from "lucide-react";

const categories = ["TECH", "STARTUP", "HR", "EDUCATION", "TRAVEL", "SPORT", "SOCIAL", "LANGUAGE", "CREATIVE", "OTHER"];
const statuses = ["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"];

const initialForm: EventPayload = {
  title: "Casual Photography Walk",
  description: "Meet up to walk around Icherisheher and take some photos.",
  type: "ACTIVITY",
  category: "CREATIVE",
  city: "Baku",
  address: "Old City Gate",
  startDateTime: "2026-07-13T17:00:00",
  endDateTime: "2026-07-13T19:00:00",
  isFree: true,
  price: 0,
  organizerName: "Leo Test",
  imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d",
  status: "PUBLISHED",
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<EventItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState({ city: "Baku", category: "", search: "", isFree: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);

  async function loadActivities() {
    setLoading(true);
    setError("");
    try {
      const data = await getEvents(filters);
      // Filter client-side to only show events of type ACTIVITY
      const filtered = data.filter(e => e.type === "ACTIVITY");
      setActivities(filtered);
      if (filtered.length > 0 && !selectedActivityId) {
        setSelectedActivityId(filtered[0].id);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load activities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadActivities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.city, filters.isFree]); // auto-trigger on simple filters

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      // Ensure type is forced to ACTIVITY
      const created = await createEvent({ ...form, type: "ACTIVITY" });
      setActivities((current) => [created, ...current]);
      setSelectedActivityId(created.id);
      setShowCreateForm(false);
      // Reset form title/desc for next use
      setForm({
        ...initialForm,
        title: "Bicycle Ride Boulevard",
        category: "SPORT",
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create activity.");
    }
  }

  // Consistent coordinate mapper based on string hashing
  const getCoordsForActivity = (activity: EventItem) => {
    let hash1 = 0;
    let hash2 = 0;
    const str = activity.title + (activity.address || "");
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
        title="Explore Activities" 
        subtitle="Browse casual user-created meetups, board games tables, coffee chat circles, and outdoor runs."
        action={
          <button 
            className="primary-button" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus size={16} /> Create Activity
          </button>
        }
      />
      <ErrorMessage message={error} />

      {showCreateForm && (
        <div className="mb-8 p-6 bg-[color-mix(in_srgb,var(--color-ink)_4%,transparent)] border border-[var(--line)] rounded-xl">
          <h2 className="text-xl font-extrabold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--color-coral)]" />
            Start a New Activity
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
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input checked={form.isFree} onChange={(e) => setForm((c) => ({ ...c, isFree: e.target.checked, price: e.target.checked ? 0 : c.price }))} type="checkbox" />
              Free activity
            </label>
            {!form.isFree ? <Input label="Price" value={String(form.price)} onChange={(price) => setForm((c) => ({ ...c, price: Number(price) }))} /> : null}
            <div className="flex gap-2 justify-end mt-4">
              <button className="secondary-button" type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button className="primary-button" type="submit">Host Activity</button>
            </div>
          </form>
        </div>
      )}

      {/* Category Selection Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
            filters.category === "" 
              ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white font-extrabold" 
              : "bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--color-ink)] hover:bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)]"
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
                ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white font-extrabold" 
                : "bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--color-ink)] hover:bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)]"
            }`}
            onClick={() => setFilters(c => ({ ...c, category: cat }))}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="split-view-container">
        {/* Left Side: Activities List */}
        <div className="flex flex-col gap-4">
          {/* Simple Search & Filter Row */}
          <div className="grid gap-3 sm:grid-cols-3 bg-[color-mix(in_srgb,var(--color-ink)_3%,transparent)] border border-[var(--line)] p-4 rounded-xl">
            <Input label="Search" value={filters.search} onChange={(search) => setFilters((c) => ({ ...c, search }))} />
            <Input label="City" value={filters.city} onChange={(city) => setFilters((c) => ({ ...c, city }))} />
            <Select label="Free" value={filters.isFree} options={["", "true", "false"]} onChange={(isFree) => setFilters((c) => ({ ...c, isFree }))} />
          </div>

          <div className="flex justify-end">
            <button className="small-action inline-flex items-center gap-1" onClick={loadActivities}>
              <Filter size={14} /> {loading ? "Syncing..." : "Apply Filters"}
            </button>
          </div>

          <div className="grid gap-4">
            {activities.length ? activities.map((activity) => {
              const isSelected = selectedActivityId === activity.id;
              // Mock participants & groups
              const mockParticipants = Math.floor((activity.id || 1) * 3.5) % 25 + 5;
              const mockGroupsCount = (activity.id || 1) % 3 + 1;

              return (
                <article 
                  className={`event-card ${isSelected ? "event-card-active" : ""}`} 
                  key={activity.id}
                  onClick={() => setSelectedActivityId(activity.id)}
                >
                  <div className="event-poster poster-orange">
                    <CalendarDays size={20} />
                    <span className="text-[10px] font-bold tracking-wider">{activity.category}</span>
                  </div>
                  <div className="event-card-body">
                    <div>
                      <p className="text-xs text-[var(--color-coral)] font-bold">{new Date(activity.startDateTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <h3 className="text-lg font-bold text-[var(--color-ink)] mt-0.5">{activity.title}</h3>
                    </div>
                    <div className="flex flex-col gap-1 my-2">
                      <div className="event-meta-row"><MapPin size={13} className="text-[var(--muted)]" /> {activity.address || activity.city}</div>
                      <div className="flex gap-4 mt-1 text-[11px] text-[var(--muted)]">
                        <span className="flex items-center gap-1"><Users size={12} /> {mockParticipants} participants</span>
                        <span className="flex items-center gap-1"><Layers size={12} /> {mockGroupsCount} groups forming</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-[var(--line)] pt-2 mt-1">
                      <span className="text-xs font-semibold text-[var(--color-ink)]">{activity.isFree ? "Free" : `${activity.price} AZN`}</span>
                      <Link className="text-xs text-[var(--color-accent)] font-bold hover:underline" href={`/events/${activity.id}`}>
                        Open Activity &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              );
            }) : <EmptyState>No activities matched your filters.</EmptyState>}
          </div>
        </div>

        {/* Right Side: Interactive Map */}
        <div className="split-view-map">
          <div className="p-3 bg-[var(--color-surface)] border-b border-[var(--line)] flex justify-between items-center">
            <span className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider">Baku Activity Map</span>
            {selectedActivityId && (
              <span className="text-xs text-[var(--color-accent)] font-semibold animate-pulse">Pin Highlighted</span>
            )}
          </div>
          <div className="relative w-full h-full bg-[var(--color-paper)]">
            <svg className="w-full h-full" style={{ minHeight: '400px' }}>
              <pattern id="gridPatternAct" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#gridPatternAct)" />
              
              {/* Baku contours representation */}
              <path d="M 50,200 C 150,150 250,300 450,200 S 650,100 850,250" fill="none" stroke="rgba(185,121,255,0.08)" strokeWidth="8" />
              <path d="M 100,100 C 300,300 500,50 700,200" fill="none" stroke="rgba(34,214,182,0.05)" strokeWidth="5" />

              {activities.map((activity) => {
                const { x, y } = getCoordsForActivity(activity);
                const isSelected = selectedActivityId === activity.id;

                return (
                  <g 
                    key={activity.id} 
                    transform={`translate(${x}%, ${y}%)`} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedActivityId(activity.id)}
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
                      {activity.title.length > 15 ? `${activity.title.substring(0, 15)}...` : activity.title}
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

