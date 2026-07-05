"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createEvent, EventItem, EventPayload, getEvents } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, Input, PageHeader, Panel, Select, SiteShell, Textarea } from "../../site";

const categories = ["", "TECH", "STARTUP", "HR", "EDUCATION", "TRAVEL", "SPORT", "SOCIAL", "LANGUAGE", "CREATIVE", "OTHER"];
const eventTypes = ["EVENT", "ACTIVITY"];
const statuses = ["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"];

const initialForm: EventPayload = {
  title: "Loopin Tech Meetup",
  description: "A local test event for group creation and realtime chat.",
  type: "EVENT",
  category: "TECH",
  city: "Baku",
  address: "Nizami street",
  startDateTime: "2026-07-06T18:00:00",
  endDateTime: "2026-07-06T20:00:00",
  isFree: true,
  price: 0,
  organizerName: "Loopin Team",
  imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
  status: "PUBLISHED",
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState({ city: "Baku", category: "", search: "", isFree: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      setEvents(await getEvents(filters));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEvents();
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const created = await createEvent(form);
      setEvents((current) => [created, ...current]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create event.");
    }
  }

  return (
    <SiteShell>
      <PageHeader title="Events" subtitle="Browse published events and create new ones for testing group flows." />
      <ErrorMessage message={error} />

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="grid gap-4">
          <Panel title="Find events">
            <div className="grid gap-3 md:grid-cols-4">
              <Input label="Search" value={filters.search} onChange={(search) => setFilters((c) => ({ ...c, search }))} />
              <Input label="City" value={filters.city} onChange={(city) => setFilters((c) => ({ ...c, city }))} />
              <Select label="Category" value={filters.category} options={categories} onChange={(category) => setFilters((c) => ({ ...c, category }))} />
              <Select label="Free" value={filters.isFree} options={["", "true", "false"]} onChange={(isFree) => setFilters((c) => ({ ...c, isFree }))} />
            </div>
            <button className="primary-button mt-4" onClick={loadEvents} type="button">
              {loading ? "Loading..." : "Apply filters"}
            </button>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            {events.length ? events.map((event) => (
              <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5" key={event.id}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-cyan-300">{event.category}</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">{event.title}</h2>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{event.status}</span>
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-slate-400">{event.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div><dt className="text-slate-500">City</dt><dd>{event.city}</dd></div>
                  <div><dt className="text-slate-500">Price</dt><dd>{event.isFree ? "Free" : `${event.price}`}</dd></div>
                </dl>
                <Link className="primary-link mt-4 inline-flex" href={`/events/${event.id}`}>
                  Open event
                </Link>
              </article>
            )) : <EmptyState>No events loaded yet.</EmptyState>}
          </div>
        </section>

        <Panel title="Create event">
          <form className="grid gap-3" onSubmit={handleCreate}>
            <Input label="Title" value={form.title} onChange={(title) => setForm((c) => ({ ...c, title }))} required />
            <Textarea label="Description" value={form.description} onChange={(description) => setForm((c) => ({ ...c, description }))} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Type" value={form.type} options={eventTypes} onChange={(type) => setForm((c) => ({ ...c, type }))} />
              <Select label="Category" value={form.category} options={categories.filter(Boolean)} onChange={(category) => setForm((c) => ({ ...c, category }))} />
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
            <button className="primary-button" type="submit">Create event</button>
          </form>
        </Panel>
      </div>
    </SiteShell>
  );
}
