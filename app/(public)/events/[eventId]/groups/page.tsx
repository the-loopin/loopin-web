"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  createGroup,
  createJoinRequest,
  EventItem,
  getEvent,
  GroupItem,
  GroupSize,
} from "@/lib/api";
import { EmptyState, ErrorMessage, Input, PageHeader, Select, SiteShell, Textarea } from "../../../../site";
import { ArrowLeft, MessageCircle, Plus, Send, Users } from "lucide-react";

const groupSizes = ["TWO", "THREE", "FOUR", "FOUR_PLUS"];
const groupSizeToMaxMembers: Record<string, number> = {
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FOUR_PLUS: 10,
};

const initialGroupForm = {
  title: "Loopin crew",
  groupSize: "FOUR",
  groupNote: "Let us meet before this and go together.",
};

export default function EventGroupsPage() {
  const params = useParams<{ eventId: string }>();
  const [eventItem, setEventItem] = useState<EventItem | null>(null);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [form, setForm] = useState(initialGroupForm);
  const [joinMessages, setJoinMessages] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadGroups() {
    setError("");
    setLoading(true);
    try {
      const loadedEvent = await getEvent(params.eventId);
      setEventItem(loadedEvent);
      // Group listing is not yet available on the backend
      setGroups([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load groups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadGroups();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.eventId]);

  async function handleCreateGroup(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    setError("");
    setMessage("");
    try {
      const group = await createGroup({
        eventId: params.eventId,
        title: form.title,
        groupSize: form.groupSize as GroupSize,
        maxMembers: groupSizeToMaxMembers[form.groupSize],
        groupNote: form.groupNote,
      });
      setGroups((current) => [group, ...current]);
      setForm(initialGroupForm);
      setMessage("Group created. You are the group admin now.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create group.");
    }
  }

  async function handleJoinRequest(group: GroupItem) {
    setError("");
    setMessage("");
    try {
      await createJoinRequest(
        group.id,
        joinMessages[group.id] || "I would like to join this group.",
      );
      setJoinMessages((current) => ({ ...current, [group.id]: "" }));
      setMessage(`Join request sent to ${group.title}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send join request.");
    }
  }

  const backHref = eventItem?.type === "ACTIVITY" ? "/activities" : "/events";
  const pageAccentClass = eventItem?.type === "ACTIVITY" ? "listing-page-activities" : "listing-page-events";

  return (
    <SiteShell>
      <div className={`listing-page event-groups-page ${pageAccentClass}`}>
        <PageHeader
          title={eventItem ? `${eventItem.title} Groups` : "Event groups"}
          subtitle="Create a group, request to join existing groups, and continue into chat once the group is ready."
          action={
            <Link className="secondary-link" href={backHref}>
              <ArrowLeft size={16} /> Back
            </Link>
          }
        />
        <ErrorMessage message={error} />
        {message ? <p className="inline-status-message">{message}</p> : null}

        <div className="groups-page-layout">
          <section className="groups-page-list">
            <div className="groups-page-toolbar">
              <div>
                <span>{loading ? "Loading" : `${groups.length} group${groups.length === 1 ? "" : "s"}`}</span>
                <strong>{eventItem?.type === "ACTIVITY" ? "Activity" : "Event"}</strong>
              </div>
              <button className="small-action sync-action" type="button" onClick={() => void loadGroups()}>
                Refresh
              </button>
            </div>

            {groups.length ? (
              <div className="groups-page-grid">
                {groups.map((group) => (
                  <article className="group-detail-card" key={group.id}>
                    <div className="group-card-heading">
                      <div>
                        <span>{group.status}</span>
                        <h2>{group.title}</h2>
                      </div>
                      <em>{group.memberCount} / {group.maxMembers}</em>
                    </div>
                    <p>{group.groupNote || "No note added for this group yet."}</p>
                    <div className="group-card-meta">
                      <span><Users size={14} /> {group.groupSize.replace("_", "+")}</span>
                      <span>{group.adminUsername}</span>
                    </div>
                    <div className="join-request-box groups-page-request">
                      <input
                        placeholder="Optional request message"
                        value={joinMessages[group.id] ?? ""}
                        onChange={(changeEvent) => setJoinMessages((current) => ({ ...current, [group.id]: changeEvent.target.value }))}
                      />
                      <button className="small-action" type="button" onClick={() => void handleJoinRequest(group)}>
                        <Send size={14} /> Request
                      </button>
                    </div>
                    <div className="group-card-actions">
                      <Link className="secondary-link" href={`/events/${params.eventId}/groups/${group.id}`}>
                        Details
                      </Link>
                      <Link className="secondary-link" href={`/events/${params.eventId}/groups/${group.id}/requests`}>
                        Requests
                      </Link>
                      <Link className="primary-link" href={`/events/${params.eventId}/groups/${group.id}/chat`}>
                        <MessageCircle size={15} /> Chat
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState>
                Group listing is unavailable because the current API does not expose an event-groups endpoint. You can still create a group for this {eventItem?.type === "ACTIVITY" ? "activity" : "event"} and share its link.
              </EmptyState>
            )}
          </section>

          <aside className="groups-create-panel">
            <h2>Create a group</h2>
            <form className="create-group-page-form" onSubmit={handleCreateGroup}>
              <Input label="Group title" value={form.title} onChange={(title) => setForm((current) => ({ ...current, title }))} required />
              <Select label="Size" value={form.groupSize} options={groupSizes} onChange={(groupSize) => setForm((current) => ({ ...current, groupSize }))} />
              <Textarea label="Group note" value={form.groupNote} onChange={(groupNote) => setForm((current) => ({ ...current, groupNote }))} />
              <button className="primary-button" type="submit">
                <Plus size={15} /> Create group
              </button>
            </form>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
