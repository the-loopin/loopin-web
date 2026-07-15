"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  addGroupMember,
  createJoinRequest,
  getCurrentUser,
  getGroup,
  getGroupMembers,
  getMyGroups,
  getMyJoinRequests,
  removeGroupMember,
  updateGroup,
  updateGroupStatus,
  type GroupItem,
  type GroupMemberItem,
  type GroupSize,
  type GroupStatus,
  type JoinRequestItem,
} from "@/lib/api";
import { EmptyState, ErrorMessage, Input, PageHeader, Panel, Select, SiteShell, Textarea } from "../../../../../site";

export default function GroupDetailPage() {
  const params = useParams<{ eventId: string; groupId: string }>();
  const [group, setGroup] = useState<GroupItem | null>(null);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingJoinRequest, setPendingJoinRequest] = useState<JoinRequestItem | null>(null);
  const [memberUserId, setMemberUserId] = useState("");
  const [joinMessage, setJoinMessage] = useState("I would like to join this group.");
  const [statusMessage, setStatusMessage] = useState("");
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
      const [loaded, currentUser, myGroups, myRequests] = await Promise.all([
        getGroup(params.groupId),
        getCurrentUser(),
        getMyGroups(),
        getMyJoinRequests(),
      ]);
      const userId = currentUser.id ?? "";
      const userIsAdmin = userId === loaded.adminId;
      const userIsMember = myGroups.some((myGroup) => myGroup.id === loaded.id);
      const pendingRequest = myRequests.find(
        (request) => request.groupId === loaded.id && request.status === "PENDING",
      ) ?? null;

      setGroup(loaded);
      setCurrentUserId(userId);
      setIsAdmin(userIsAdmin);
      setIsMember(userIsMember);
      setPendingJoinRequest(pendingRequest);
      setForm({
        title: loaded.title,
        groupSize: loaded.groupSize,
        maxMembers: String(loaded.maxMembers),
        groupNote: loaded.groupNote || "",
        status: loaded.status,
      });

      if (userIsMember || userIsAdmin) {
        setMembers(await getGroupMembers(params.groupId));
      } else {
        setMembers([]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load group.");
    }
  }

  async function loadMembers() {
    if (!isMember && !isAdmin) return;

    try {
      setMembers(await getGroupMembers(params.groupId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load members.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGroup();
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.groupId]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) return;

    try {
      setGroup(await updateGroup(params.groupId, {
        title: form.title,
        groupSize: form.groupSize as GroupSize,
        maxMembers: Number(form.maxMembers),
        groupNote: form.groupNote,
      }));
      setStatusMessage("Group updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update group.");
    }
  }

  async function handleStatus() {
    if (!isAdmin) return;

    try {
      setGroup(await updateGroupStatus(params.groupId, { status: form.status as GroupStatus }));
      setStatusMessage("Group status updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update status.");
    }
  }

  async function handleAddMember() {
    if (!isAdmin || !memberUserId.trim()) return;

    try {
      await addGroupMember(params.groupId, memberUserId.trim());
      setMemberUserId("");
      await loadMembers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add member.");
    }
  }

  async function handleRemoveMember(userId = memberUserId) {
    if (!isAdmin || !userId) return;

    try {
      await removeGroupMember(params.groupId, userId);
      await loadMembers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove member.");
    }
  }

  async function handleJoinRequest() {
    if (
      isAdmin ||
      isMember ||
      pendingJoinRequest ||
      group?.status !== "OPEN"
    ) {
      return;
    }

    setError("");
    setStatusMessage("");

    try {
      const request = await createJoinRequest(params.groupId, joinMessage.trim());
      setPendingJoinRequest(request);
      setStatusMessage("Join request sent.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send join request.");
    }
  }

  const canOpenChat = isMember || isAdmin;

  return (
    <SiteShell>
      <PageHeader
        title={group?.title ?? "Group detail"}
        subtitle={group ? `${group.memberCount}/${group.maxMembers} members - ${group.status}` : "Loading group"}
        action={canOpenChat ? <Link className="primary-link" href={`/events/${params.eventId}/groups/${params.groupId}/chat`}>Open chat</Link> : undefined}
      />
      <ErrorMessage message={error} />
      {statusMessage ? <p className="inline-status-message">{statusMessage}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        {isAdmin ? (
          <Panel title="Manage group">
            <form className="grid gap-3" onSubmit={handleUpdate}>
              <Input label="Title" value={form.title} onChange={(title) => setForm((current) => ({ ...current, title }))} />
              <div className="grid gap-3 md:grid-cols-3">
                <Select label="Size" value={form.groupSize} options={["TWO", "THREE", "FOUR", "FOUR_PLUS"]} onChange={(groupSize) => setForm((current) => ({ ...current, groupSize }))} />
                <Input label="Max members" value={form.maxMembers} onChange={(maxMembers) => setForm((current) => ({ ...current, maxMembers }))} />
                <Select label="Status" value={form.status} options={["OPEN", "FULL", "ARCHIVED", "CANCELLED"]} onChange={(status) => setForm((current) => ({ ...current, status }))} />
              </div>
              <Textarea label="Group note" value={form.groupNote} onChange={(groupNote) => setForm((current) => ({ ...current, groupNote }))} />
              <div className="flex flex-wrap gap-2">
                <button className="primary-button" type="submit">Save group</button>
                <button className="secondary-button" onClick={handleStatus} type="button">Update status only</button>
                <Link className="secondary-link" href={`/events/${params.eventId}/groups/${params.groupId}/requests`}>Join requests</Link>
              </div>
            </form>
          </Panel>
        ) : (
          <Panel title="Group details">
            <p className="text-sm text-[var(--muted)]">{group?.groupNote || "No note added for this group yet."}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Admin: {group?.adminUsername ?? "Loopin user"}
            </p>
          </Panel>
        )}

        <div className="grid gap-5">
          <Panel title="Join this group">
            {isAdmin ? (
              <EmptyState>You manage this group.</EmptyState>
            ) : isMember ? (
              <EmptyState>You are already a member of this group.</EmptyState>
            ) : pendingJoinRequest ? (
              <EmptyState>Your join request is pending.</EmptyState>
            ) : group?.status !== "OPEN" ? (
              <EmptyState>This group is not accepting join requests.</EmptyState>
            ) : (
              <>
                <Textarea label="Message" value={joinMessage} onChange={setJoinMessage} />
                <button className="primary-button mt-3 w-full" onClick={handleJoinRequest} type="button">Send join request</button>
              </>
            )}
          </Panel>

          <Panel title="Members">
            {isAdmin ? (
              <div className="mb-3 flex gap-2">
                <input className="h-10 min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-teal)] transition-colors" placeholder="User ID" value={memberUserId} onChange={(event) => setMemberUserId(event.target.value)} />
                <button className="primary-button" onClick={handleAddMember} type="button">Add</button>
              </div>
            ) : null}
            {members.length ? (
              <div className="grid gap-2">
                {members.map((member) => (
                  <div className="flex items-center justify-between rounded-md border border-[var(--line)] bg-[var(--color-surface)] p-3 text-sm" key={member.id}>
                    <span>User #{member.userId}</span>
                    {isAdmin && member.userId !== currentUserId ? (
                      <button className="text-red-300 hover:text-red-200" onClick={() => void handleRemoveMember(member.userId)} type="button">Remove</button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>{canOpenChat ? "No members loaded." : "Join the group to view members."}</EmptyState>
            )}
          </Panel>
        </div>
      </div>
    </SiteShell>
  );
}
