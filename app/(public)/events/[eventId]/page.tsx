"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { deleteEvent, EventItem, EventPayload, getEvent, updateEvent, EventCategory, EventUpdateRequest } from "@/lib/api";
import { ErrorMessage, Input, PageHeader, Panel, Select, SiteShell, Textarea } from "../../../site";

const categories = ["TECH", "STARTUP", "HR", "EDUCATION", "TRAVEL", "SPORT", "SOCIAL", "LANGUAGE", "CREATIVE", "OTHER"];
export default function EventDetailRoutePage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params.eventId;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EventPayload | null>(null);
  const [error, setError] = useState("");

  async function loadEvent() {
    setError("");
    try {
      const loaded = await getEvent(eventId);
      setEvent(loaded);
      setForm({
        ...loaded,
        address: loaded.address ?? "",
        latitude: loaded.latitude ?? 0,
        longitude: loaded.longitude ?? 0,
        price: Number(loaded.price ?? 0),
        imageUrl: loaded.imageUrl ?? "",
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load event.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEvent();
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleUpdate(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (!form) return;
    try {
      const payload: EventUpdateRequest = {
        title: form.title,
        description: form.description,
        type: form.type,
        category: form.category,
        city: form.city,
        address: form.address || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
        startDateTime: form.startDateTime,
        endDateTime: form.endDateTime,
        isFree: form.isFree,
        price: form.price,
        organizerName: form.organizerName,
        imageUrl: form.imageUrl || undefined,
      };
      const updated = await updateEvent(eventId, payload);
      setEvent(updated);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update event.");
    }
  }

  async function handleDelete() {
    try {
      await deleteEvent(eventId);
      router.push("/events");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete event.");
    }
  }

  return (
    <SiteShell>
      <PageHeader
        title={event?.title ?? "Event detail"}
        subtitle={event ? `${event.city} - ${event.category} - ${event.status}` : "Loading event"}
        action={<Link className="primary-link" href={`/events/${eventId}/groups/new`}>Create group</Link>}
      />
      <ErrorMessage message={error} />

      {form ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Panel title="Edit event">
            <form className="grid gap-3" onSubmit={handleUpdate}>
              <Input label="Title" value={form.title} onChange={(title) => setForm((c) => c && { ...c, title })} />
              <Textarea label="Description" value={form.description} onChange={(description) => setForm((c) => c && { ...c, description })} />
              <div className="grid gap-3 md:grid-cols-2">
                <Select label="Category" value={form.category} options={categories} onChange={(category) => setForm((c) => c && { ...c, category: category as EventCategory })} />
                <div className="grid gap-1"><span className="text-sm font-medium">Status</span><p className="rounded-md border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">{event?.status ?? "DRAFT"}</p></div>
                <Input label="City" value={form.city} onChange={(city) => setForm((c) => c && { ...c, city })} />
                <Input label="Address" value={form.address} onChange={(address) => setForm((c) => c && { ...c, address })} />
                <Input label="Start" value={form.startDateTime} onChange={(startDateTime) => setForm((c) => c && { ...c, startDateTime })} />
                <Input label="End" value={form.endDateTime} onChange={(endDateTime) => setForm((c) => c && { ...c, endDateTime })} />
                <Input label="Organizer" value={form.organizerName} onChange={(organizerName) => setForm((c) => c && { ...c, organizerName })} />
                <Input label="Image URL" value={form.imageUrl || ""} onChange={(imageUrl) => setForm((c) => c && { ...c, imageUrl })} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="primary-button" type="submit">Save event</button>
                <button className="secondary-button" onClick={handleDelete} type="button">Delete event</button>
              </div>
            </form>
          </Panel>
          <Panel title="Event actions">
            <div className="grid gap-2">
              <Link className="primary-link justify-center" href={`/events/${eventId}/groups/new`}>Create group</Link>
              <Link className="secondary-link justify-center" href="/events">Back to events</Link>
            </div>
          </Panel>
        </div>
      ) : null}
    </SiteShell>
  );
}
