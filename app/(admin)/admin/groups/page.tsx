"use client";

import Link from "next/link";
import { useState } from "react";
import { getGroup, GroupItem } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, Input, PageHeader, Panel, SiteShell } from "../../../site";

export default function AdminGroupsPage() {
  const [groupId, setGroupId] = useState("1");
  const [group, setGroup] = useState<GroupItem | null>(null);
  const [error, setError] = useState("");

  async function loadGroup() {
    setError("");
    try {
      setGroup(await getGroup(groupId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load group.");
    }
  }

  return (
    <SiteShell>
      <PageHeader title="Admin groups" subtitle="The backend currently exposes group lookup by ID, so this page manages one group at a time." />
      <ErrorMessage message={error} />
      <Panel>
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <Input label="Group ID" value={groupId} onChange={setGroupId} />
          <button className="primary-button" onClick={loadGroup} type="button">Load group</button>
        </div>
        {group ? (
          <article className="rounded-md border border-white/10 bg-slate-950 p-4">
            <h2 className="text-xl font-semibold text-white">{group.title}</h2>
            <p className="mt-1 text-sm text-slate-400">Event #{group.eventId} - {group.memberCount}/{group.maxMembers} members - {group.status}</p>
            <div className="mt-4 flex gap-2">
              <Link className="primary-link" href={`/events/${group.eventId}/groups/${group.id}`}>Open group</Link>
              <Link className="secondary-link" href={`/events/${group.eventId}/groups/${group.id}/requests`}>Requests</Link>
            </div>
          </article>
        ) : <EmptyState>No group loaded.</EmptyState>}
      </Panel>
    </SiteShell>
  );
}
