"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  addGroupMember,
  createJoinRequest,
  getGroup,
  getGroupMembers,
  GroupItem,
  GroupMemberItem,
  removeGroupMember,
  updateGroup,
  updateGroupStatus,
  GroupSize,
  GroupStatus,
} from "@/lib/api";
import { EmptyState, ErrorMessage, Input, PageHeader, Panel, Select, SiteShell, Textarea } from "../../../../../site";

export default function GroupDetailPage() {
  const params = useParams<{ eventId: string; groupId: string }>();
  const [group, setGroup] = useState<GroupItem | null>(null);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [memberUserId, setMemberUserId] = useState("");
  const [joinMessage, setJoinMessage] = useState("I would like to join this group.");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    groupSize: "FOUR",
    maxMembers: "4",
    groupNote: "",
    status: "OPEN",
  });

  async function loadGroup() {
    setError("");
    try {
      const loaded = await getGroup(params.groupId);
      setGroup(loaded);
      setForm({
        title: loaded.title,
        groupSize: loaded.groupSize,
        maxMembers: String(loaded.maxMembers),
        groupNote: loaded.groupNote || "",
        status: loaded.status,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load group.");
    }
  }

  async function loadMembers() {
    try {
      setMembers(await getGroupMembers(params.groupId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load members.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGroup();
      void loadMembers();
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.groupId]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setGroup(await updateGroup(params.groupId, {
        title: form.title,
        groupSize: form.groupSize as GroupSize,
        maxMembers: Number(form.maxMembers),
        groupNote: form.groupNote,
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update group.");
    }
  }

  async function handleStatus() {
    try {
      setGroup(await updateGroupStatus(params.groupId, { status: form.status as GroupStatus }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update status.");
    }
  }

  async function handleAddMember() {
    try {
      await addGroupMember(params.groupId, memberUserId);
      await loadMembers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add member.");
    }
  }

  async function handleRemoveMember(userId = memberUserId) {
    try {
      await removeGroupMember(params.groupId, userId);
      await loadMembers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove member.");
    }
  }

  async function handleJoinRequest() {
    try {
      await createJoinRequest(params.groupId, joinMessage);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send join request.");
    }
  }

  return (
    <SiteShell>
      <PageHeader
        title={group?.title ?? "Group detail"}
        subtitle={group ? `${group.memberCount}/${group.maxMembers} members - ${group.status}` : "Loading group"}
        action={<Link className="primary-link" href={`/events/${params.eventId}/groups/${params.groupId}/chat`}>Open chat</Link>}
      />
      <ErrorMessage message={error} />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Panel title="Manage group">
          <form className="grid gap-3" onSubmit={handleUpdate}>
            <Input label="Title" value={form.title} onChange={(title) => setForm((c) => ({ ...c, title }))} />
            <div className="grid gap-3 md:grid-cols-3">
              <Select label="Size" value={form.groupSize} options={["TWO", "THREE", "FOUR", "FOUR_PLUS"]} onChange={(groupSize) => setForm((c) => ({ ...c, groupSize }))} />
              <Input label="Max members" value={form.maxMembers} onChange={(maxMembers) => setForm((c) => ({ ...c, maxMembers }))} />
              <Select label="Status" value={form.status} options={["OPEN", "FULL", "ARCHIVED", "CANCELLED"]} onChange={(status) => setForm((c) => ({ ...c, status }))} />
            </div>
            <Textarea label="Group note" value={form.groupNote} onChange={(groupNote) => setForm((c) => ({ ...c, groupNote }))} />
            <div className="flex flex-wrap gap-2">
              <button className="primary-button" type="submit">Save group</button>
              <button className="secondary-button" onClick={handleStatus} type="button">Update status only</button>
              <Link className="secondary-link" href={`/events/${params.eventId}/groups/${params.groupId}/requests`}>Join requests</Link>
            </div>
          </form>
        </Panel>

        <div className="grid gap-5">
          <Panel title="Join this group">
            <Textarea label="Message" value={joinMessage} onChange={setJoinMessage} />
            <button className="primary-button mt-3 w-full" onClick={handleJoinRequest} type="button">Send join request</button>
          </Panel>

          <Panel title="Members">
            <div className="mb-3 flex gap-2">
              <input className="h-10 min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-teal)] transition-colors" placeholder="User ID" value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)} />
              <button className="primary-button" onClick={handleAddMember} type="button">Add</button>
            </div>
            {members.length ? (
              <div className="grid gap-2">
                {members.map((member) => (
                  <div className="flex items-center justify-between rounded-md border border-[var(--line)] bg-[var(--color-surface)] p-3 text-sm" key={member.id}>
                    <span>User #{member.userId}</span>
                    <button className="text-red-300 hover:text-red-200" onClick={() => void handleRemoveMember(String(member.userId))} type="button">Remove</button>
                  </div>
                ))}
              </div>
            ) : <EmptyState>No members loaded.</EmptyState>}
          </Panel>
        </div>
      </div>
    </SiteShell>
  );
}
