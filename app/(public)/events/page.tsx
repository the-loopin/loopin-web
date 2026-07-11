"use client";

import { FormEvent, MouseEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createEvent,
  EventItem,
  EventPayload,
  getEvents,
  getMyLoopedEvents,
  loopInEvent,
  unloopEvent,
} from "@/lib/api/loopin";
import { getAuthToken } from "@/lib/auth/session";
import { EmptyState, ErrorMessage, Input, PageHeader, Select, SiteShell, Textarea } from "../../site";
import { ArrowLeft, CalendarDays, CheckCircle2, CircleMinus, Info, MapPin, Navigation, Plus, RefreshCw, Sparkles, Users } from "lucide-react";

const categories = ["TECH", "STARTUP", "HR", "EDUCATION", "TRAVEL", "SPORT", "SOCIAL", "LANGUAGE", "CREATIVE", "OTHER"];
const statuses = ["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"];
const bakuBounds = {
  north: 40.47,
  south: 40.3,
  east: 50.02,
  west: 49.78,
};
const bakuCenter = { latitude: 40.3777, longitude: 49.892 };

function formatCategoryName(category: string) {
  if (!category) return "All Categories";
  return category.charAt(0) + category.slice(1).toLowerCase();
}

const initialForm: EventPayload = {
  title: "Baku Startup Hackathon",
  description: "Join the local hacker community to build projects and network with organizers.",
  type: "EVENT",
  category: "STARTUP",
  city: "Baku",
  address: "Idea Lab, Nizami Street",
  latitude: bakuCenter.latitude,
  longitude: bakuCenter.longitude,
  startDateTime: "2026-07-12T10:00:00",
  endDateTime: "2026-07-12T18:00:00",
  isFree: true,
  price: 0,
  organizerName: "Baku Hackers Club",
  imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  status: "PUBLISHED",
};

const initialFilters = { city: "Baku", category: "", search: "", isFree: "" };
const loopedEventsStorageKey = "loopin-looped-event-ids";
type ActionToast = {
  type: "added" | "removed";
  title: string;
  message: string;
};

function getStoredLoopedIds() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const ids = JSON.parse(window.localStorage.getItem(loopedEventsStorageKey) ?? "[]") as string[];
    return Object.fromEntries(ids.map((id) => [id, true]));
  } catch {
    return {};
  }
}

function saveStoredLoopedIds(loopedIds: Record<string, boolean>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(loopedEventsStorageKey, JSON.stringify(Object.keys(loopedIds)));
}

function getMapUrl(latitude: number, longitude: number, span = 0.018) {
  return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - span}%2C${latitude - span * 0.66}%2C${longitude + span}%2C${latitude + span * 0.66}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

function getPickerMarkerPosition(latitude?: number | null, longitude?: number | null) {
  const lat = latitude ?? bakuCenter.latitude;
  const lon = longitude ?? bakuCenter.longitude;
  return {
    left: `${Math.min(96, Math.max(4, ((lon - bakuBounds.west) / (bakuBounds.east - bakuBounds.west)) * 100))}%`,
    top: `${Math.min(96, Math.max(4, ((bakuBounds.north - lat) / (bakuBounds.north - bakuBounds.south)) * 100))}%`,
  };
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<EventItem["id"] | null>(null);
  const [flippedEventIds, setFlippedEventIds] = useState<Record<string, boolean>>({});
  const [loopedEventIds, setLoopedEventIds] = useState<Record<string, boolean>>({});
  const [actionToast, setActionToast] = useState<ActionToast | null>(null);

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const data = await getEvents(filters);
      // Filter client-side to only show events of type EVENT
      const filtered = data.filter(e => e.type === "EVENT");
      setEvents(filtered);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.city, filters.isFree, filters.search]); // auto-trigger on simple filters

  useEffect(() => {
    if (!getAuthToken()) {
      return;
    }

    setLoopedEventIds(getStoredLoopedIds());

    async function loadLoopedEvents() {
      try {
        const loopedEvents = await getMyLoopedEvents();
        const loopedIds = Object.fromEntries(loopedEvents.map((event) => [String(event.id), true]));
        setLoopedEventIds(loopedIds);
        saveStoredLoopedIds(loopedIds);
      } catch {
        // Keep the locally stored state if the sync request is temporarily unavailable.
      }
    }

    void loadLoopedEvents();
  }, []);

  useEffect(() => {
    if (!actionToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setActionToast(null), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [actionToast]);

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

  const getLocationForEvent = (event: EventItem) => {
    if (event.latitude != null && event.longitude != null) {
      return {
        latitude: event.latitude,
        longitude: event.longitude,
        precise: true,
      };
    }

    let hash1 = 0;
    let hash2 = 0;
    const str = event.title + (event.address || "");
    for (let i = 0; i < str.length; i++) {
      hash1 = str.charCodeAt(i) + ((hash1 << 5) - hash1);
      hash2 = str.charCodeAt(i) * 31 + ((hash2 << 7) - hash2);
    }
    return {
      latitude: 40.35 + Math.abs(hash2 % 800) / 10000,
      longitude: 49.79 + Math.abs(hash1 % 1300) / 10000,
      precise: false,
    };
  };

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;
  const selectedLocation = selectedEvent ? getLocationForEvent(selectedEvent) : { latitude: 40.3777, longitude: 49.892, precise: false };
  const selectedMapUrl = getMapUrl(selectedLocation.latitude, selectedLocation.longitude);
  const pickerLatitude = form.latitude ?? bakuCenter.latitude;
  const pickerLongitude = form.longitude ?? bakuCenter.longitude;
  const pickerMapUrl = getMapUrl(pickerLatitude, pickerLongitude, 0.12);
  const pickerMarkerPosition = getPickerMarkerPosition(form.latitude, form.longitude);

  function toggleMoreInfo(eventId: EventItem["id"]) {
    setFlippedEventIds((current) => ({ ...current, [String(eventId)]: !current[String(eventId)] }));
  }

  function resetFilters() {
    setFilters(initialFilters);
    setFlippedEventIds({});
    setSelectedEventId(null);
  }

  function handleLocationPick(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    const longitude = bakuBounds.west + x * (bakuBounds.east - bakuBounds.west);
    const latitude = bakuBounds.north - y * (bakuBounds.north - bakuBounds.south);

    setForm((current) => ({
      ...current,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    }));
  }

  async function handleLoopIn(eventItem: EventItem) {
    if (!getAuthToken()) {
      setError("Please sign in before using Loopin.");
      return;
    }

    const eventId = String(eventItem.id);
    setError("");
    setActionToast(null);
    try {
      if (loopedEventIds[eventId]) {
        await unloopEvent(eventId);
        setLoopedEventIds((current) => {
          const next = { ...current };
          delete next[eventId];
          saveStoredLoopedIds(next);
          return next;
        });
        setEvents((current) =>
          current.map((item) =>
            String(item.id) === eventId
              ? { ...item, loopedCount: Math.max(0, (item.loopedCount ?? 1) - 1) }
              : item,
          ),
        );
        setActionToast({
          type: "removed",
          title: "Removed from Loopin",
          message: eventItem.title,
        });
      } else {
        const updated = await loopInEvent(eventId);
        setLoopedEventIds((current) => {
          const next = { ...current, [eventId]: true };
          saveStoredLoopedIds(next);
          return next;
        });
        setEvents((current) =>
          current.map((item) =>
            String(item.id) === eventId
              ? { ...item, loopedCount: updated.loopedCount ?? (item.loopedCount ?? 0) + 1 }
              : item,
          ),
        );
        setActionToast({
          type: "added",
          title: "Added to Loopin",
          message: eventItem.title,
        });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not Loopin this event.");
    }
  }

  function openGroups(eventItem: EventItem) {
    router.push(`/events/${eventItem.id}/groups`);
  }

  return (
    <SiteShell>
      <div className="listing-page listing-page-events">
        <PageHeader
          title="Explore Events"
          subtitle="Find planned gatherings, startup nights, and events organized in your city."
          action={
            <button
              className="primary-button"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus size={16} className="create-icon" /> Create Event
            </button>
          }
        />
        <ErrorMessage message={error} />
        {actionToast ? (
          <div className={`action-toast action-toast-${actionToast.type}`} role="status">
            <span className="action-toast-icon">
              {actionToast.type === "added" ? <CheckCircle2 size={18} /> : <CircleMinus size={18} />}
            </span>
            <span>
              <strong>{actionToast.title}</strong>
              <span className="action-toast-message">{actionToast.message}</span>
            </span>
          </div>
        ) : null}

      {showCreateForm && (
        <div className="mb-8 p-6 bg-[color-mix(in_srgb,var(--color-ink)_4%,transparent)] border border-[var(--line)] rounded-xl">
          <h2 className="text-xl font-extrabold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--color-coral)]" />
            Host a New Event
          </h2>
          <form className="grid gap-3" onSubmit={handleCreate}>
            <Input label="Title" value={form.title} onChange={(title) => setForm((c) => ({ ...c, title }))} required />
            <Textarea label="Description" value={form.description} onChange={(description) => setForm((c) => ({ ...c, description }))} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Category" value={form.category} options={categories} onChange={(category) => setForm((c) => ({ ...c, category }))} />
              <Input label="City" value={form.city} onChange={(city) => setForm((c) => ({ ...c, city }))} required />
              <Input label="Address" value={form.address} onChange={(address) => setForm((c) => ({ ...c, address }))} />
              <Input label="Latitude" value={String(form.latitude ?? "")} onChange={(latitude) => setForm((c) => ({ ...c, latitude: Number(latitude) }))} />
              <Input label="Longitude" value={String(form.longitude ?? "")} onChange={(longitude) => setForm((c) => ({ ...c, longitude: Number(longitude) }))} />
              <Input label="Start" value={form.startDateTime} onChange={(startDateTime) => setForm((c) => ({ ...c, startDateTime }))} />
              <Input label="End" value={form.endDateTime} onChange={(endDateTime) => setForm((c) => ({ ...c, endDateTime }))} />
              <Input label="Organizer" value={form.organizerName} onChange={(organizerName) => setForm((c) => ({ ...c, organizerName }))} />
              <Select label="Status" value={form.status} options={statuses} onChange={(status) => setForm((c) => ({ ...c, status }))} />
            </div>
            <div className="location-picker-panel">
              <div className="location-picker-copy">
                <strong>Event location</strong>
                <span>Click the map to place the event marker. Older events without coordinates use an approximate Baku fallback.</span>
              </div>
              <div className="location-picker-map" onClick={handleLocationPick}>
                <iframe className="real-map-frame" src={pickerMapUrl} title="Pick event location" />
                <div className="location-picker-hitbox" />
                <div className="location-picker-marker" style={pickerMarkerPosition}>
                  <MapPin size={22} />
                </div>
              </div>
            </div>
            <Input label="Image URL" value={form.imageUrl} onChange={(imageUrl) => setForm((c) => ({ ...c, imageUrl }))} />
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
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

      <div className={`split-view-container listing-layout-clean ${selectedEvent ? "is-map-open" : ""}`}>
        <div className="listing-results">
          <div className="listing-filter-bar">
            <Input label="Search" value={filters.search} onChange={(search) => setFilters((c) => ({ ...c, search }))} />
            <Input label="City" value={filters.city} onChange={(city) => setFilters((c) => ({ ...c, city }))} />
            <Select label="Category" value={filters.category} options={["", ...categories]} onChange={(category) => setFilters((c) => ({ ...c, category }))} />
            <Select label="Price" value={filters.isFree} options={["", "true", "false"]} onChange={(isFree) => setFilters((c) => ({ ...c, isFree }))} />
          </div>
          <div className="filter-summary-strip">
            <span>{events.length} events</span>
            <strong>{filters.category ? formatCategoryName(filters.category) : "All categories"}</strong>
            <em>{filters.isFree === "true" ? "Free only" : filters.isFree === "false" ? "Paid only" : "Any price"}</em>
            <button className="small-action sync-action" onClick={resetFilters}>
              <RefreshCw size={15} /> {loading ? "Syncing..." : "Reset"}
            </button>
          </div>

          <div className="listing-card-list">
            {events.length ? events.map((event) => {
              const isSelected = selectedEventId === event.id;
              const isFlipped = Boolean(flippedEventIds[String(event.id)]);

              const eventId = String(event.id);
              const isLooped = Boolean(loopedEventIds[eventId]);

              return (
                <div className="event-card-stack" key={event.id}>
                  <article 
                    className={`event-card event-card-flip ${isSelected ? "event-card-active" : ""} ${isFlipped ? "is-flipped" : ""}`}
                    onClick={() => setSelectedEventId((current) => current === event.id ? null : event.id)}
                  >
                    <div className="event-card-inner">
                      <div className="event-card-face event-card-front">
                        <div className="event-poster poster-violet">
                          <CalendarDays size={20} />
                          <span>{formatCategoryName(event.category)}</span>
                        </div>
                        <div className="event-card-body">
                          <div>
                            <p>{new Date(event.startDateTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <h3>{event.title}</h3>
                          </div>
                          <div className="event-meta-row"><MapPin size={13} /> {event.address || event.city}</div>
                          <div className="event-card-stats">
                            <div className="event-price-pill">{event.isFree ? "Free" : `${event.price} AZN`}</div>
                            <div className="event-looped-count"><Users size={13} /> {event.loopedCount ?? 0} looped</div>
                          </div>
                          <div className="event-card-actions">
                            <button
                              className={`loopin-button ${isLooped ? "is-looped" : ""}`}
                              type="button"
                              onClick={(clickEvent) => { clickEvent.stopPropagation(); void handleLoopIn(event); }}
                            >
                              <Users size={14} /> {isLooped ? "Looped" : "Loopin"}
                            </button>
                            {isLooped ? (
                              <button
                                className="groups-button"
                                type="button"
                                onClick={(clickEvent) => { clickEvent.stopPropagation(); openGroups(event); }}
                              >
                                <Users size={14} /> Groups
                              </button>
                            ) : null}
                            <button className="more-info-button" type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); toggleMoreInfo(event.id); }}>
                              <Info size={14} /> More info
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="event-card-face event-card-back">
                        <button className="card-back-button" type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); toggleMoreInfo(event.id); }}>
                          <ArrowLeft size={14} /> Back
                        </button>
                        <div className="event-back-main">
                          <div className="event-back-copy">
                            <strong>{event.title}</strong>
                            <p>{event.description || "No description added yet."}</p>
                          </div>
                          <div className="event-back-details">
                            <span><CalendarDays size={13} /> {new Date(event.startDateTime).toLocaleString()} - {new Date(event.endDateTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                            <span><MapPin size={13} /> {event.address || event.city}</span>
                          </div>
                        </div>
                        <div className="event-back-footer">
                          <div className="detail-chip-row">
                            <span>{event.isFree ? "Free" : `${event.price} AZN`}</span>
                            <span>{formatCategoryName(event.category)}</span>
                            <span>{event.organizerName}</span>
                          </div>
                          <div className="event-card-actions event-back-actions">
                            <button
                              className={`loopin-button ${isLooped ? "is-looped" : ""}`}
                              type="button"
                              onClick={(clickEvent) => { clickEvent.stopPropagation(); void handleLoopIn(event); }}
                            >
                              <Users size={14} /> {isLooped ? "Looped" : "Loopin"}
                            </button>
                            {isLooped ? (
                              <button
                                className="groups-button"
                                type="button"
                                onClick={(clickEvent) => { clickEvent.stopPropagation(); openGroups(event); }}
                              >
                                <Users size={14} /> Groups
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            }) : <EmptyState>No planned events matched your filters.</EmptyState>}
          </div>
        </div>

        {selectedEvent && (
          <div className="split-view-map listing-map-panel">
            <div className="map-panel-header">
              <span>Baku Event Map</span>
              <em>Location focused</em>
            </div>
            <div className="map-stage">
              <iframe
                className="real-map-frame"
                key={`${selectedLocation.latitude}-${selectedLocation.longitude}`}
                src={selectedMapUrl}
                title={`${selectedEvent.title} map`}
              />
              <div className="selected-location-card">
                <span><Navigation size={14} /> Selected location</span>
                <strong>{selectedEvent.title}</strong>
                <p>{selectedEvent.address || selectedEvent.city}</p>
                <em>
                  {selectedLocation.precise
                    ? `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
                    : "Approximate pin from address"}
                </em>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </SiteShell>
  );
}

