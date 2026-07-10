"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteAdminEvent, EventItem, getAdminEvents } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, PageHeader, Panel, SiteShell } from "../../../site";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState("");

  async function loadEvents() {
    setError("");
    try {
      setEvents(await getAdminEvents());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load events.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEvents();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function deleteEvent(eventId: number) {
    try {
      await deleteAdminEvent(String(eventId));
      await loadEvents();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete event.");
    }
  }

  return (
    <SiteShell>
      <PageHeader title="Admin events" />
      <ErrorMessage message={error} />
      <Panel>
        {events.length ? (
          <div className="grid gap-3">
            {events.map((event) => (
              <article className="flex flex-col justify-between gap-3 rounded-md border border-white/10 bg-surface p-4 md:flex-row md:items-center" key={event.id}>
                <div>
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-sm text-slate-400">{event.city} - {event.status}</p>
                </div>
                <div className="flex gap-2">
                  <Link className="secondary-link" href={`/events/${event.id}`}>Open</Link>
                  <button className="secondary-button" onClick={() => void deleteEvent(event.id)} type="button">Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState>No events loaded.</EmptyState>}
      </Panel>
    </SiteShell>
  );
}
