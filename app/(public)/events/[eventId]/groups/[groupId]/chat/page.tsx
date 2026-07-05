"use client";

import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { createGroupMessageClient, publishGroupMessage } from "@/lib/api/realtimeMessages";
import type { GroupMessage } from "@/lib/types/message";
import { useMessages } from "@/hooks/useMessages";

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
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 px-4 py-8">
      <header className="border-b border-zinc-200 pb-4">
        <p className="text-sm text-zinc-500">Group #{groupId}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-zinc-950">Realtime chat</h1>
          <span className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700">
            {connectionStatus}
          </span>
        </div>
      </header>

      <section className="flex min-h-[420px] flex-1 flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        {isLoading ? <p className="text-sm text-zinc-500">Loading messages...</p> : null}
        {isError ? (
          <button
            className="self-start rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
            type="button"
            onClick={() => void refetch()}
          >
            Retry message history
          </button>
        ) : null}

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <p className="text-sm text-zinc-500">No messages yet.</p>
          ) : null}

          {messages.map((message) => (
            <article key={message.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-950">{message.senderName}</p>
                <time className="text-xs text-zinc-500">
                  {new Date(message.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">{message.messageText}</p>
            </article>
          ))}
        </div>

        <form className="flex gap-2 border-t border-zinc-200 pt-4" onSubmit={handleSubmit}>
          <input
            className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950"
            maxLength={1000}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Write a message"
            value={messageText}
          />
          <button
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={!canSend}
            type="submit"
          >
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
