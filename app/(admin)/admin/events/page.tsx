"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { deleteAdminEvent, EventItem, getAdminEvents, EventStatus } from "@/lib/api";
import { EmptyState, ErrorMessage, PageHeader, Panel, SiteShell } from "../../../site";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Dynamic Server-Side Query States
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Client-side quick filter for titles/cities within the loaded page
  const [searchQuery, setSearchQuery] = useState("");

  // Track operational loaders for safety actions
  const [processingEventId, setProcessingEventId] = useState<EventItem["id"] | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  // Core API loading function with explicit backend synchronization
  const loadEvents = useCallback(async (page: number, status: string) => {
    setError("");
    setLoading(true);
    try {
      // Maps 'ALL' filter to undefined so backend gets standard null values
      const resolvedStatus = status === "ALL" ? undefined : (status as EventStatus);
      
      // Hits: GET /v1/admin/events?status=...&page=...&size=10
      const data = await getAdminEvents(resolvedStatus, page, 10);
      
      setEvents(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load events from the database.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Triggers fresh server requests automatically whenever structural parameters modify
  useEffect(() => {
    void loadEvents(currentPage, statusFilter);
  }, [currentPage, statusFilter, loadEvents]);

  // Handle server-side status change resets back to the first database index
  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(0);
  };

  async function confirmDeleteEvent() {
    if (!eventToDelete) return;

    setProcessingEventId(eventToDelete.id);
    try {
      await deleteAdminEvent(String(eventToDelete.id));
      setEventToDelete(null);
      // Re-fetch current database state securely
      await loadEvents(currentPage, statusFilter);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not complete event deletion.");
    } finally {
      setProcessingEventId(null);
    }
  }

  // Client-side text matching overlay over the dynamically loaded dataset
  const filteredEvents = events.filter((event) => {
    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.city?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SiteShell>
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:opacity-80 transition-opacity"
        >
          <span className="text-base">←</span> Back to Dashboard
        </Link>
      </div>

      <PageHeader 
        title="Admin Events" 
        subtitle="Monitor, query, filter, and moderate platform events live from the operational database."
      />
      
      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Control Unit: Dynamic Live Filters */}
      <div className="mb-6 mt-6 grid gap-4 md:grid-cols-[1fr_200px] items-end bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--line)] shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">Search Visible Set</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter current page rows by title or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--color-background)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]"
            />
            <span className="absolute left-3 top-2.5 text-[var(--color-muted)]">🔍</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">Database Status Filter</label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--color-background)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] appearance-none cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <span className="absolute right-3 top-3 pointer-events-none text-xs text-[var(--color-muted)]">▼</span>
          </div>
        </div>
      </div>

      <Panel >
        {loading ? (
          <div className="py-12 text-center text-[var(--color-muted)] font-medium">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full text-[var(--color-accent)] mb-3"></div>
            <p className="text-sm">Fetching structural records from database...</p>
          </div>
        ) : filteredEvents.length ? (
          <div className="divide-y divide-[var(--line)]">
            {filteredEvents.map((event) => {
              const isProcessing = processingEventId === event.id;

              return (
                <article 
                  className={`flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center transition-colors hover:bg-[var(--color-background)]/20 ${
                    isProcessing ? "opacity-50 pointer-events-none" : ""
                  }`} 
                  key={event.id}
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-background)] border border-[var(--line)] flex items-center justify-center text-xl shrink-0 shadow-sm">
                      📅
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-base text-[var(--color-ink)]">{event.title}</h3>
                        
                        <span className={`text-[10px] tracking-wide font-bold px-2 py-0.5 uppercase rounded border ${
                          event.status === "PUBLISHED" 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                            : event.status === "COMPLETED"
                            ? "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-3 text-xs font-medium text-[var(--color-muted)] mt-1">
                        <span>📍 {event.city || "Online / External Venue"}</span>
                        <span>•</span>
                        <span className="font-mono bg-[var(--color-background)] px-1.5 rounded">ID: #{event.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Administrative Action Block */}
                  <div className="flex gap-3 self-end md:self-center">
                    <Link 
                      className="inline-flex items-center gap-1 py-1.5 px-3 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--color-background)] text-[var(--color-ink)] hover:bg-[var(--color-surface)] shadow-sm transition-all" 
                      href={`/events/${event.id}`}
                    >
                      <span>👁️</span> Open
                    </Link>
                    
                    <button 
                      className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all" 
                      onClick={() => setEventToDelete(event)} 
                      type="button"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState>
            <div className="py-10 text-center">
              <span className="text-4xl block mb-2">🎟️</span>
              <p className="text-sm font-semibold text-[var(--color-ink)]">No events match your context rules.</p>
              {(searchQuery || statusFilter !== "ALL") && (
                <button 
                  onClick={() => { setSearchQuery(""); handleStatusChange("ALL"); }} 
                  className="mt-3 text-xs font-bold text-[var(--color-accent)] hover:underline"
                >
                  Reset active filter state
                </button>
              )}
            </div>
          </EmptyState>
        )}

        {/* Dynamic Database Pagination Control Track */}
        {!loading && totalPages > 1 && (
          <div className="p-4 bg-[var(--color-background)]/30 flex items-center justify-between border-t border-[var(--line)]">
            <span className="text-xs font-medium text-[var(--color-muted)]">
              Page <strong className="text-[var(--color-ink)]">{currentPage + 1}</strong> of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="px-4 py-1.5 text-xs font-semibold border border-[var(--line)] rounded-lg hover:bg-[var(--color-background)] text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-1.5 text-xs font-semibold border border-[var(--line)] rounded-lg hover:bg-[var(--color-background)] text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Panel>

      {/* CONFIRM MODAL POPUP */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] border border-[var(--line)] rounded-xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[var(--color-ink)]">Delete Platform Event?</h3>
            <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">
              Are you sure you want to drop <strong className="text-[var(--color-ink)]">{eventToDelete.title}</strong>? All sub-entities, active groups, and member links are immediately detached permanently.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                type="button" 
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-background)] border border-[var(--line)] text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors shadow-sm"
                onClick={() => setEventToDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                onClick={() => void confirmDeleteEvent()}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}