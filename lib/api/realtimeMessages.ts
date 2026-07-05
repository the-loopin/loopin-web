"use client";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAuthToken } from "../auth/session";
import type { CreateGroupMessageRequest, GroupMessage } from "../types/message";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

function getWebSocketUrl(): string {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${baseUrl}/ws`;
}

export function createGroupMessageClient(
  groupId: string,
  onMessage: (message: GroupMessage) => void,
  onStatusChange?: (status: string) => void,
): Client {
  const token = getAuthToken();

  const client = new Client({
    reconnectDelay: 3000,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    webSocketFactory: () => new SockJS(getWebSocketUrl()),
    onConnect: () => {
      onStatusChange?.("Connected");

      client.subscribe(`/topic/groups/${groupId}/messages`, (frame) => {
        onMessage(JSON.parse(frame.body) as GroupMessage);
      });
    },
    onDisconnect: () => onStatusChange?.("Disconnected"),
    onStompError: (frame) => {
      onStatusChange?.(frame.headers.message ?? "STOMP error");
    },
    onWebSocketError: () => onStatusChange?.("WebSocket error"),
  });

  return client;
}

export function publishGroupMessage(
  client: Client,
  groupId: string,
  message: CreateGroupMessageRequest,
): void {
  client.publish({
    destination: `/app/groups/${groupId}/messages`,
    body: JSON.stringify(message),
  });
}
