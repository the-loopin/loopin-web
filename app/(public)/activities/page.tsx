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
  title: "Casual Photography Walk",
  description: "Meet up to walk around Icherisheher and take some photos.",
  type: "ACTIVITY",
  category: "CREATIVE",
  city: "Baku",
  address: "Old City Gate",
  latitude: bakuCenter.latitude,
  longitude: bakuCenter.longitude,
  startDateTime: "2026-07-13T17:00:00",
  endDateTime: "2026-07-13T19:00:00",
  isFree: true,
  price: 0,
  organizerName: "Leo Test",
  imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d",
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

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<EventItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<EventItem["id"] | null>(null);
  const [flippedActivityIds, setFlippedActivityIds] = useState<Record<string, boolean>>({});
  const [loopedActivityIds, setLoopedActivityIds] = useState<Record<string, boolean>>({});
  const [actionToast, setActionToast] = useState<ActionToast | null>(null);

  async function loadActivities() {
    setLoading(true);
    setError("");
    try {
      const data = await getEvents(filters);
      // Filter client-side to only show events of type ACTIVITY
      const filtered = data.filter(e => e.type === "ACTIVITY");
      setActivities(filtered);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load activities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadActivities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.city, filters.isFree, filters.search]); // auto-trigger on simple filters

  useEffect(() => {
    if (!getAuthToken()) {
      return;
    }

    setLoopedActivityIds(getStoredLoopedIds());

    async function loadLoopedActivities() {
      try {
        const loopedEvents = await getMyLoopedEvents();
        const loopedIds = Object.fromEntries(loopedEvents.map((event) => [String(event.id), true]));
        setLoopedActivityIds(loopedIds);
        saveStoredLoopedIds(loopedIds);
      } catch {
        // Keep the locally stored state if the sync request is temporarily unavailable.
      }
    }

    void loadLoopedActivities();
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

  const getLocationForActivity = (activity: EventItem) => {
    if (activity.latitude != null && activity.longitude != null) {
      return {
        latitude: activity.latitude,
        longitude: activity.longitude,
        precise: true,
      };
    }

    let hash1 = 0;
    let hash2 = 0;
    const str = activity.title + (activity.address || "");
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

  const selectedActivity = activities.find((activity) => activity.id === selectedActivityId) ?? null;
  const selectedLocation = selectedActivity ? getLocationForActivity(selectedActivity) : { latitude: 40.3777, longitude: 49.892, precise: false };
  const selectedMapUrl = getMapUrl(selectedLocation.latitude, selectedLocation.longitude);
  const pickerLatitude = form.latitude ?? bakuCenter.latitude;
  const pickerLongitude = form.longitude ?? bakuCenter.longitude;
  const pickerMapUrl = getMapUrl(pickerLatitude, pickerLongitude, 0.12);
  const pickerMarkerPosition = getPickerMarkerPosition(form.latitude, form.longitude);

  function toggleMoreInfo(activityId: EventItem["id"]) {
    setFlippedActivityIds((current) => ({ ...current, [String(activityId)]: !current[String(activityId)] }));
  }

  function resetFilters() {
    setFilters(initialFilters);
    setFlippedActivityIds({});
    setSelectedActivityId(null);
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

  async function handleLoopIn(activity: EventItem) {
    if (!getAuthToken()) {
      setError("Please sign in before using Loopin.");
      return;
    }

    const activityId = String(activity.id);
    setError("");
    setActionToast(null);
    try {
      if (loopedActivityIds[activityId]) {
        await unloopEvent(activityId);
        setLoopedActivityIds((current) => {
          const next = { ...current };
          delete next[activityId];
          saveStoredLoopedIds(next);
          return next;
        });
        setActivities((current) =>
          current.map((item) =>
            String(item.id) === activityId
              ? { ...item, loopedCount: Math.max(0, (item.loopedCount ?? 1) - 1) }
              : item,
          ),
        );
        setActionToast({
          type: "removed",
          title: "Removed from Loopin",
          message: activity.title,
        });
      } else {
        const updated = await loopInEvent(activityId);
        setLoopedActivityIds((current) => {
          const next = { ...current, [activityId]: true };
          saveStoredLoopedIds(next);
          return next;
        });
        setActivities((current) =>
          current.map((item) =>
            String(item.id) === activityId
              ? { ...item, loopedCount: updated.loopedCount ?? (item.loopedCount ?? 0) + 1 }
              : item,
          ),
        );
        setActionToast({
          type: "added",
          title: "Added to Loopin",
          message: activity.title,
        });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not Loopin this activity.");
    }
  }

  function openGroups(activity: EventItem) {
    router.push(`/events/${activity.id}/groups`);
  }

  return (
    <SiteShell>
      <div className="listing-page listing-page-activities">
        <PageHeader 
          title="Explore Activities" 
          subtitle="Browse casual user-created meetups, board games tables, coffee chat circles, and outdoor runs."
          action={
            <button 
              className="primary-button" 
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus size={16} className="create-icon" /> Create Activity
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
            Start a New Activity
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
                <strong>Activity location</strong>
                <span>Click the map to place the activity marker. Older activities without coordinates use an approximate Baku fallback.</span>
              </div>
              <div className="location-picker-map" onClick={handleLocationPick}>
                <iframe className="real-map-frame" src={pickerMapUrl} title="Pick activity location" />
                <div className="location-picker-hitbox" />
                <div className="location-picker-marker" style={pickerMarkerPosition}>
                  <MapPin size={22} />
                </div>
              </div>
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

      <div className={`split-view-container listing-layout-clean ${selectedActivity ? "is-map-open" : ""}`}>
        <div className="listing-results">
          <div className="listing-filter-bar">
            <Input label="Search" value={filters.search} onChange={(search) => setFilters((c) => ({ ...c, search }))} />
            <Input label="City" value={filters.city} onChange={(city) => setFilters((c) => ({ ...c, city }))} />
            <Select label="Category" value={filters.category} options={["", ...categories]} onChange={(category) => setFilters((c) => ({ ...c, category }))} />
            <Select label="Price" value={filters.isFree} options={["", "true", "false"]} onChange={(isFree) => setFilters((c) => ({ ...c, isFree }))} />
          </div>
          <div className="filter-summary-strip">
            <span>{activities.length} activities</span>
            <strong>{filters.category ? formatCategoryName(filters.category) : "All categories"}</strong>
            <em>{filters.isFree === "true" ? "Free only" : filters.isFree === "false" ? "Paid only" : "Any price"}</em>
            <button className="small-action sync-action" onClick={resetFilters}>
              <RefreshCw size={15} /> {loading ? "Syncing..." : "Reset"}
            </button>
          </div>

          <div className="listing-card-list">
            {activities.length ? activities.map((activity) => {
              const isSelected = selectedActivityId === activity.id;
              const isFlipped = Boolean(flippedActivityIds[String(activity.id)]);

              const activityId = String(activity.id);
              const isLooped = Boolean(loopedActivityIds[activityId]);

              return (
                <div className="event-card-stack" key={activity.id}>
                  <article 
                    className={`event-card event-card-flip ${isSelected ? "event-card-active" : ""} ${isFlipped ? "is-flipped" : ""}`}
                    onClick={() => setSelectedActivityId((current) => current === activity.id ? null : activity.id)}
                  >
                    <div className="event-card-inner">
                      <div className="event-card-face event-card-front">
                        <div className="event-poster poster-orange">
                          <CalendarDays size={20} />
                          <span>{formatCategoryName(activity.category)}</span>
                        </div>
                        <div className="event-card-body">
                          <div>
                            <p>{new Date(activity.startDateTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <h3>{activity.title}</h3>
                          </div>
                          <div className="event-meta-row"><MapPin size={13} /> {activity.address || activity.city}</div>
                          <div className="event-card-stats">
                            <div className="event-price-pill">{activity.isFree ? "Free" : `${activity.price} AZN`}</div>
                            <div className="event-looped-count"><Users size={13} /> {activity.loopedCount ?? 0} looped</div>
                          </div>
                          <div className="event-card-actions">
                            <button
                              className={`loopin-button ${isLooped ? "is-looped" : ""}`}
                              type="button"
                              onClick={(clickEvent) => { clickEvent.stopPropagation(); void handleLoopIn(activity); }}
                            >
                              <Users size={14} /> {isLooped ? "Looped" : "Loopin"}
                            </button>
                            {isLooped ? (
                              <button
                                className="groups-button"
                                type="button"
                                onClick={(clickEvent) => { clickEvent.stopPropagation(); openGroups(activity); }}
                              >
                                <Users size={14} /> Groups
                              </button>
                            ) : null}
                            <button className="more-info-button" type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); toggleMoreInfo(activity.id); }}>
                              <Info size={14} /> More info
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="event-card-face event-card-back">
                        <button className="card-back-button" type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); toggleMoreInfo(activity.id); }}>
                          <ArrowLeft size={14} /> Back
                        </button>
                        <div className="event-back-main">
                          <div className="event-back-copy">
                            <strong>{activity.title}</strong>
                            <p>{activity.description || "No description added yet."}</p>
                          </div>
                          <div className="event-back-details">
                            <span><CalendarDays size={13} /> {new Date(activity.startDateTime).toLocaleString()} - {new Date(activity.endDateTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                            <span><MapPin size={13} /> {activity.address || activity.city}</span>
                          </div>
                        </div>
                        <div className="event-back-footer">
                          <div className="detail-chip-row">
                            <span>{activity.isFree ? "Free" : `${activity.price} AZN`}</span>
                            <span>{formatCategoryName(activity.category)}</span>
                            <span>{activity.organizerName}</span>
                          </div>
                          <div className="event-card-actions event-back-actions">
                            <button
                              className={`loopin-button ${isLooped ? "is-looped" : ""}`}
                              type="button"
                              onClick={(clickEvent) => { clickEvent.stopPropagation(); void handleLoopIn(activity); }}
                            >
                              <Users size={14} /> {isLooped ? "Looped" : "Loopin"}
                            </button>
                            {isLooped ? (
                              <button
                                className="groups-button"
                                type="button"
                                onClick={(clickEvent) => { clickEvent.stopPropagation(); openGroups(activity); }}
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
            }) : <EmptyState>No activities matched your filters.</EmptyState>}
          </div>
        </div>

        {selectedActivity && (
          <div className="split-view-map listing-map-panel">
            <div className="map-panel-header">
              <span>Baku Activity Map</span>
              <em>Location focused</em>
            </div>
            <div className="map-stage">
              <iframe
                className="real-map-frame"
                key={`${selectedLocation.latitude}-${selectedLocation.longitude}`}
                src={selectedMapUrl}
                title={`${selectedActivity.title} map`}
              />
              <div className="selected-location-card">
                <span><Navigation size={14} /> Selected location</span>
                <strong>{selectedActivity.title}</strong>
                <p>{selectedActivity.address || selectedActivity.city}</p>
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

