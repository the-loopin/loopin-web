"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  approveJoinRequest,
  getGroupJoinRequests,
  getMyJoinRequests,
  JoinRequestItem,
  rejectJoinRequest,
} from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, PageHeader, Panel, SiteShell } from "../../../../../../site";

export default function GroupRequestsPage() {
  const params = useParams<{ eventId: string; groupId: string }>();
  const [requests, setRequests] = useState<JoinRequestItem[]>([]);
  const [mine, setMine] = useState<JoinRequestItem[]>([]);
  const [error, setError] = useState("");

  async function loadRequests() {
    setError("");
    try {
      setRequests(await getGroupJoinRequests(params.groupId));
      setMine(await getMyJoinRequests());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load requests.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.groupId]);

  async function approve(id: number) {
    try {
      await approveJoinRequest(params.groupId, String(id));
      await loadRequests();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not approve request.");
    }
  }

  async function reject(id: number) {
    try {
      await rejectJoinRequest(params.groupId, String(id));
      await loadRequests();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reject request.");
    }
  }

  return (
    <SiteShell>
      <PageHeader
        title="Join requests"
        subtitle={`Manage requests for group #${params.groupId}.`}
        action={<Link className="secondary-link" href={`/events/${params.eventId}/groups/${params.groupId}`}>Back to group</Link>}
      />
      <ErrorMessage message={error} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Group requests">
          {requests.length ? (
            <div className="grid gap-3">
              {requests.map((request) => (
                <article className="rounded-md border border-white/10 bg-slate-950 p-4" key={request.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">User #{request.userId}</p>
                      <p className="mt-1 text-sm text-slate-400">{request.message || "No message"}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">{request.status}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="primary-button" onClick={() => void approve(request.id)} type="button">Approve</button>
                    <button className="secondary-button" onClick={() => void reject(request.id)} type="button">Reject</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <EmptyState>No requests for this group.</EmptyState>}
        </Panel>

        <Panel title="My requests">
          {mine.length ? (
            <div className="grid gap-3">
              {mine.map((request) => (
                <div className="rounded-md border border-white/10 bg-slate-950 p-4 text-sm" key={request.id}>
                  <p className="font-semibold text-white">Group #{request.groupId}</p>
                  <p className="mt-1 text-slate-400">{request.message || "No message"}</p>
                  <p className="mt-2 text-xs uppercase text-cyan-300">{request.status}</p>
                </div>
              ))}
            </div>
          ) : <EmptyState>You have no join requests.</EmptyState>}
        </Panel>
      </div>
    </SiteShell>
  );
}
