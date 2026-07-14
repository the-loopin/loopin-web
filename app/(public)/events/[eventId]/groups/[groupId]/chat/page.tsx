"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Client } from "@stomp/stompjs";
import {
  ArrowLeft,
  CircleAlert,
  Hash,
  Info,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { createGroupMessageClient, publishGroupMessage } from "@/lib/api/realtimeMessages";
import { getCurrentUser, getGroup } from "@/lib/api";
import type { GroupMessage } from "@/lib/types/message";
import { useMessages } from "@/hooks/useMessages";
import { SiteShell } from "../../../../../../site";

type MessageRow =
  | { type: "date"; key: string; label: string }
  | { type: "message"; key: string; message: GroupMessage };

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function getDateKey(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "unknown" : date.toDateString();
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Earlier";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(date);
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function GroupChatPage() {
  const params = useParams<{ eventId: string; groupId: string }>();
  const { eventId, groupId } = params;
  const { data: initialMessages = [], isLoading, isError, refetch } = useMessages(groupId);
  const groupQuery = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroup(groupId),
    enabled: Boolean(groupId),
  });
  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });
  const [liveMessageState, setLiveMessageState] = useState<{
    groupId: string;
    messages: GroupMessage[];
  }>({ groupId: "", messages: [] });
  const [messageText, setMessageText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting");
  const [composerError, setComposerError] = useState("");
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const client = createGroupMessageClient(
      groupId,
      (message) => {
        setLiveMessageState((currentState) => {
          const currentMessages = currentState.groupId === groupId ? currentState.messages : [];

          if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
            return currentState;
          }

          return {
            groupId,
            messages: [...currentMessages, message],
          };
        });
      },
      setConnectionStatus,
    );

    clientRef.current = client;
    client.activate();

    return () => {
      clientRef.current = null;
      void client.deactivate();
    };
  }, [groupId]);

  const messages = useMemo(() => {
    const messageById = new Map<string, GroupMessage>();
    const liveMessages = liveMessageState.groupId === groupId ? liveMessageState.messages : [];

    for (const message of initialMessages) {
      if (message.id) messageById.set(message.id, message);
    }
    for (const message of liveMessages) {
      if (message.id) messageById.set(message.id, message);
    }

    return Array.from(messageById.values()).sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  }, [groupId, initialMessages, liveMessageState]);

  const messageRows = useMemo<MessageRow[]>(() => {
    const rows: MessageRow[] = [];
    let previousDateKey = "";

    for (const message of messages) {
      const dateKey = getDateKey(message.createdAt);
      if (dateKey !== previousDateKey) {
        rows.push({
          type: "date",
          key: `date-${dateKey}`,
          label: formatDateLabel(message.createdAt),
        });
        previousDateKey = dateKey;
      }

      rows.push({ type: "message", key: message.id, message });
    }

    return rows;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const group = groupQuery.data;
  const currentUserId = currentUserQuery.data ? String(currentUserQuery.data.id) : null;
  const isConnected = connectionStatus === "Connected";
  const isConnecting = connectionStatus === "Connecting" || connectionStatus === "Reconnecting";
  const groupIsLocked = group?.status === "ARCHIVED" || group?.status === "CANCELLED";
  const canSend = isConnected && !groupIsLocked && messageText.trim().length > 0;

  function sendCurrentMessage() {
    const trimmedMessage = messageText.trim();
    if (!clientRef.current?.connected || !trimmedMessage || groupIsLocked) return;

    setComposerError("");

    try {
      publishGroupMessage(clientRef.current, groupId, { messageText: trimmedMessage });
      setMessageText("");
    } catch {
      setComposerError("The message could not be sent. Check the connection and try again.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendCurrentMessage();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) sendCurrentMessage();
    }
  }

  function reconnect() {
    const client = clientRef.current;
    if (!client) return;

    setConnectionStatus("Connecting");
    if (client.active) {
      void client.deactivate().then(() => client.activate());
      return;
    }

    client.activate();
  }

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-[1320px] py-3">
        <div className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--color-surface)] shadow-[0_28px_90px_rgba(0,0,0,0.18)]">
          <header className="flex flex-col gap-4 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                aria-label="Back to group"
                className="icon-button shrink-0"
                href={`/events/${eventId}/groups/${groupId}`}
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--color-teal)_16%,transparent)] text-[var(--color-teal)]">
                <Hash size={21} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-2xl">
                    {group?.title ?? (groupQuery.isLoading ? "Loading group..." : "Group chat")}
                  </h1>
                  {group?.status ? (
                    <span className="rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {group.status}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                  <Users size={14} />
                  {group ? `${group.memberCount}/${group.maxMembers} members` : "Realtime group conversation"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold ${
                  isConnected
                    ? "border-[color-mix(in_srgb,var(--color-teal)_45%,var(--line))] bg-[color-mix(in_srgb,var(--color-teal)_10%,transparent)] text-[var(--color-teal)]"
                    : "border-[var(--line)] bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] text-[var(--muted)]"
                }`}
              >
                {isConnected ? <Wifi size={15} /> : isConnecting ? <Loader2 className="animate-spin" size={15} /> : <WifiOff size={15} />}
                <span>{connectionStatus}</span>
              </div>
              {!isConnected && !isConnecting ? (
                <button className="icon-button" onClick={reconnect} type="button" aria-label="Reconnect chat">
                  <RefreshCw size={17} />
                </button>
              ) : null}
            </div>
          </header>

          <div className="grid min-h-[650px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="flex min-h-[650px] min-w-0 flex-col border-[var(--line)] lg:border-r">
              <div
                className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-7"
                style={{
                  background:
                    "radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--color-teal) 10%, transparent), transparent 32%), var(--color-paper)",
                }}
              >
                {isLoading ? (
                  <div className="grid h-full place-items-center">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <Loader2 className="animate-spin" size={18} />
                      Loading conversation...
                    </div>
                  </div>
                ) : null}

                {isError && !isLoading ? (
                  <div className="mx-auto grid max-w-md place-items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--color-surface)] p-6 text-center">
                    <CircleAlert className="text-[var(--color-coral)]" size={26} />
                    <div>
                      <h2 className="font-bold text-[var(--color-ink)]">Could not load messages</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        You may need to join this group, sign in again, or retry the request.
                      </p>
                    </div>
                    <button className="secondary-button" onClick={() => void refetch()} type="button">
                      <RefreshCw size={15} /> Retry
                    </button>
                  </div>
                ) : null}

                {!isLoading && !isError && messages.length === 0 ? (
                  <div className="grid h-full min-h-[420px] place-items-center">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]">
                        <Hash size={28} />
                      </div>
                      <h2 className="mt-4 text-lg font-extrabold text-[var(--color-ink)]">Start the conversation</h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        Coordinate the plan, choose a meeting point, and keep everyone in the loop.
                      </p>
                    </div>
                  </div>
                ) : null}

                {!isLoading && !isError ? (
                  <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                    {messageRows.map((row) => {
                      if (row.type === "date") {
                        return (
                          <div className="my-2 flex items-center gap-3" key={row.key}>
                            <span className="h-px flex-1 bg-[var(--line)]" />
                            <span className="rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--muted)] backdrop-blur">
                              {row.label}
                            </span>
                            <span className="h-px flex-1 bg-[var(--line)]" />
                          </div>
                        );
                      }

                      const { message } = row;
                      const isOwnMessage = currentUserId !== null && String(message.senderId) === currentUserId;

                      return (
                        <article
                          className={`flex items-end gap-2.5 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          key={row.key}
                        >
                          {!isOwnMessage ? (
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--color-surface)] text-xs font-extrabold text-[var(--color-teal)] shadow-sm">
                              {getInitials(message.senderName)}
                            </div>
                          ) : null}

                          <div className={`max-w-[82%] sm:max-w-[72%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                            {!isOwnMessage ? (
                              <p className="mb-1 px-1 text-xs font-bold text-[var(--muted)]">{message.senderName}</p>
                            ) : null}
                            <div
                              className={`rounded-[22px] px-4 py-3 shadow-sm ${
                                isOwnMessage
                                  ? "rounded-br-md bg-[var(--color-accent)] text-white"
                                  : "rounded-bl-md border border-[var(--line)] bg-[var(--color-surface)] text-[var(--color-ink)]"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.messageText}</p>
                              <div className={`mt-1.5 text-right text-[10px] ${isOwnMessage ? "text-white/70" : "text-[var(--muted)]"}`}>
                                {formatMessageTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : null}
              </div>

              <div className="border-t border-[var(--line)] bg-[var(--color-surface)] p-4 sm:p-5">
                {groupIsLocked ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] px-4 py-3 text-sm text-[var(--muted)]">
                    <LockKeyhole size={18} />
                    This group is {group?.status.toLowerCase()} and no longer accepts messages.
                  </div>
                ) : (
                  <form className="mx-auto w-full max-w-3xl" onSubmit={handleSubmit}>
                    <div className="flex items-end gap-2 rounded-[22px] border border-[var(--line)] bg-[var(--color-paper)] p-2 transition focus-within:border-[var(--color-teal)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-teal)_12%,transparent)]">
                      <textarea
                        aria-label="Message"
                        className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-[var(--color-ink)] outline-none placeholder:text-[var(--muted)]"
                        maxLength={1000}
                        onChange={(event) => setMessageText(event.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder={isConnected ? "Write a message..." : "Waiting for connection..."}
                        rows={1}
                        value={messageText}
                      />
                      <button
                        aria-label="Send message"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--color-accent)] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                        disabled={!canSend}
                        type="submit"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 px-1 text-xs text-[var(--muted)]">
                      <span>Enter to send · Shift + Enter for a new line</span>
                      <span>{messageText.length}/1000</span>
                    </div>
                    {composerError ? <p className="mt-2 text-sm text-[var(--color-coral)]">{composerError}</p> : null}
                  </form>
                )}
              </div>
            </section>

            <aside className="hidden bg-[color-mix(in_srgb,var(--color-paper)_72%,var(--color-surface))] p-5 lg:block">
              <div className="sticky top-28 grid gap-4">
                <section className="rounded-3xl border border-[var(--line)] bg-[var(--color-surface)] p-5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--color-ink)]">
                    <Info size={17} className="text-[var(--color-teal)]" />
                    About this group
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {group?.groupNote || "No group note has been added yet."}
                  </p>
                  <div className="mt-5 grid gap-3 border-t border-[var(--line)] pt-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--muted)]">Members</span>
                      <strong className="text-[var(--color-ink)]">
                        {group ? `${group.memberCount}/${group.maxMembers}` : "—"}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--muted)]">Group size</span>
                      <strong className="text-[var(--color-ink)]">{group?.groupSize?.replaceAll("_", " ") ?? "—"}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--muted)]">Status</span>
                      <strong className="text-[var(--color-ink)]">{group?.status ?? "—"}</strong>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-[var(--line)] bg-[var(--color-surface)] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]">
                      <ShieldCheck size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Group admin</p>
                      <p className="truncate font-bold text-[var(--color-ink)]">{group?.adminUsername ?? "Loading..."}</p>
                    </div>
                  </div>
                </section>

                <Link className="secondary-link w-full" href={`/events/${eventId}/groups/${groupId}`}>
                  View group details
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
