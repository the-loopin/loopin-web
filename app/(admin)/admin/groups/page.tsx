"use client";

import Link from "next/link";
import { useState } from "react";
import { getGroup, GroupItem } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, Input, PageHeader, Panel, SiteShell } from "../../../site";

export default function AdminGroupsPage() {
  const [groupId, setGroupId] = useState("");
  const [group, setGroup] = useState<GroupItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadGroup() {
    if (!groupId.trim()) {
      setError("Please enter a valid Group ID.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const fetchedGroup = await getGroup(groupId);
      if (!fetchedGroup) {
        throw new Error("No group data returned from the database.");
      }
      setGroup(fetchedGroup);
    } catch (caught) {
      setGroup(null);
      setError(caught instanceof Error ? caught.message : "Could not find a group with that ID.");
    } finally {
      setLoading(false);
    }
  }

  // Helper to calculate the occupancy percentage of the group
  const getCapacityPercentage = (current: number, max: number) => {
    if (!max) return 0;
    return Math.min(Math.round((current / max) * 100), 100);
  };

  // Helper to resolve status badge styling dynamically
  const getStatusBadgeClass = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "FULL":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <SiteShell>
      {/* Back navigation */}
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:opacity-80 transition-opacity"
        >
          <span className="text-base">←</span> Back to Dashboard
        </Link>
      </div>

      <PageHeader 
        title="Admin Groups" 
        subtitle="Search and inspect specific groups directly from the database by entering their unique ID." 
      />
      
      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Search Bar Panel */}
      <Panel >
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-xl">
          <div className="flex-1">
            <Input 
              label="Search Group by ID" 
              value={groupId} 
              onChange={setGroupId}
            />
          </div>
          <button 
            className="primary-button h-[42px] flex items-center justify-center gap-2 px-6 rounded-lg font-semibold transition-all disabled:opacity-50" 
            onClick={loadGroup} 
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Load Group</span>
              </>
            )}
          </button>
        </div>
      </Panel>

      {/* RESULT SECTION */}
      {loading ? (
        /* Enhanced skeleton template during dynamic database loading */
        <Panel >
          <div className="animate-pulse space-y-5 py-3">
            <div className="h-6 bg-[var(--line)] rounded w-1/4"></div>
            <div className="h-4 bg-[var(--line)] rounded w-1/2"></div>
            <div className="h-10 bg-[var(--line)] rounded w-full mt-4"></div>
            <div className="flex gap-2 pt-4 border-t border-[var(--line)]">
              <div className="h-10 bg-[var(--line)] rounded w-32"></div>
              <div className="h-10 bg-[var(--line)] rounded w-32"></div>
            </div>
          </div>
        </Panel>
      ) : group ? (
        <article className="rounded-xl border border-[var(--line)] bg-[var(--color-surface)] p-6 shadow-sm transition-all hover:border-[var(--color-accent)]/30">
          
          {/* Header & Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--line)] pb-4 mb-5">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-[var(--color-muted)] bg-[var(--color-background)] px-2.5 py-1 rounded-md">
                Group ID: #{group.id}
              </span>
              <h2 className="text-xl font-bold text-[var(--color-ink)] mt-3">{group.title}</h2>
            </div>
            
            {/* Status Badge */}
            <span className={`self-start sm:self-center text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border ${getStatusBadgeClass(group.status)}`}>
              Status: {group.status ?? "UNKNOWN"}
            </span>
          </div>

          {/* Group Metadata & Occupancy Progress */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">Associated Event</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                <span className="text-lg">📅</span> Event ID: #{group.eventId}
              </div>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                <span>Group Occupancy</span>
                <span className="text-[var(--color-ink)] font-semibold">{group.memberCount} / {group.maxMembers} Members</span>
              </div>
              <div className="w-full bg-[var(--color-background)] rounded-full h-3 overflow-hidden border border-[var(--line)]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    getCapacityPercentage(group.memberCount, group.maxMembers) >= 100 
                      ? "bg-rose-500" 
                      : "bg-[var(--color-accent)]"
                  }`}
                  style={{ width: `${getCapacityPercentage(group.memberCount, group.maxMembers)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Links & Moderation Shortcuts */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--line)]">
            <Link 
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity" 
              href={`/events/${group.eventId}/groups/${group.id}`}
            >
              <span>👁️</span> Open Group Profile
            </Link>
            <Link 
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors" 
              href={`/events/${group.eventId}/groups/${group.id}/requests`}
            >
              <span>📩</span> Join Requests
            </Link>
          </div>

        </article>
      ) : (
        <EmptyState>
          <div className="py-8 text-center">
            <span className="text-5xl block mb-3">👥</span>
            <p className="text-base font-semibold text-[var(--color-ink)]">No Group Loaded</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Enter a valid Group ID in the lookup container above to fetch details.</p>
          </div>
        </EmptyState>
      )}
    </SiteShell>
  );
}