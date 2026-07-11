"use client";

import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { createGroupMessageClient, publishGroupMessage } from "@/lib/api/realtimeMessages";
import type { GroupMessage } from "@/lib/types/message";
import { useMessages } from "@/hooks/useMessages";
import { PageHeader, Panel, SiteShell } from "../../../../../../site";

export default function GroupChatPage() {
  const params = useParams<{ eventId: string; groupId: string }>();
  const groupId = params.groupId;
  const { data: initialMessages = [], isLoading, isError, refetch } = useMessages(groupId);
  const [liveMessageState, setLiveMessageState] = useState<{
    groupId: string;
    messages: GroupMessage[];
  }>({ groupId: "", messages: [] });
  const [messageText, setMessageText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting");
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    const client = createGroupMessageClient(
      groupId,
      (message) => {
        setLiveMessageState((currentState) => {
          const currentMessages =
            currentState.groupId === groupId ? currentState.messages : [];

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
    const liveMessages =
      liveMessageState.groupId === groupId ? liveMessageState.messages : [];

    for (const message of initialMessages) {
      messageById.set(message.id, message);
    }

    for (const message of liveMessages) {
      messageById.set(message.id, message);
    }

    return Array.from(messageById.values());
  }, [groupId, initialMessages, liveMessageState]);

  const canSend = connectionStatus === "Connected" && messageText.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = messageText.trim();
    if (!clientRef.current?.connected || !trimmedMessage) {
      return;
    }

    publishGroupMessage(clientRef.current, groupId, { messageText: trimmedMessage });
    setMessageText("");
  }

  return (
    <SiteShell>
      <PageHeader
        title="Realtime chat"
        subtitle={`Group #${groupId}`}
        action={<span className="rounded-full border border-[var(--line)] px-3 py-1 text-sm text-[var(--muted)]">{connectionStatus}</span>}
      />

      <Panel>
        <div className="flex min-h-[520px] flex-col gap-3">
        {isLoading ? <p className="text-sm text-[var(--muted)]">Loading messages...</p> : null}
        {isError ? (
          <button
            className="secondary-button self-start"
            type="button"
            onClick={() => void refetch()}
          >
            Retry message history
          </button>
        ) : null}

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <p className="text-sm text-[var(--muted)]">No messages yet.</p>
          ) : null}

          {messages.map((message) => (
            <article key={message.id} className="rounded-md border border-[var(--line)] bg-[var(--color-surface)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--color-ink)]">{message.senderName}</p>
                <time className="text-xs text-[var(--muted)]">
                  {new Date(message.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{message.messageText}</p>
            </article>
          ))}
        </div>

        <form className="flex gap-2 border-t border-[var(--line)] pt-4" onSubmit={handleSubmit}>
          <input
            className="min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-teal)] transition-colors"
            maxLength={1000}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Write a message"
            value={messageText}
          />
          <button
            className="primary-button"
            disabled={!canSend}
            type="submit"
          >
            Send
          </button>
        </form>
        </div>
      </Panel>
    </SiteShell>
  );
}
