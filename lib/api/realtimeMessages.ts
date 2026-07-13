"use client";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAuthToken } from "../auth/session";
import type {
  CreateGroupMessageRequest,
  GroupMessage,
} from "../types/message";

function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api"
  ).replace(/\/+$/, "");
}

function getWebSocketUrl(): string {
  const configuredWebSocketUrl =
    process.env.NEXT_PUBLIC_WEBSOCKET_URL;

  if (configuredWebSocketUrl) {
    return configuredWebSocketUrl.replace(/\/+$/, "");
  }

  const apiBaseUrl = getApiBaseUrl();

  // REST URL /api/v1 ilə bitirsə, yalnız /v1 hissəsini çıxar.
  // /api context path qalmalıdır.
  const serverBaseUrl = apiBaseUrl.replace(/\/v1$/, "");

  return `${serverBaseUrl}/ws`;
}

export function createGroupMessageClient(
  groupId: string,
  onMessage: (message: GroupMessage) => void,
  onStatusChange?: (status: string) => void,
): Client {
  const token = getAuthToken();
  let hasConnected = false;

  const client = new Client({
    reconnectDelay: 3000,
    heartbeatIncoming: 25000,
    heartbeatOutgoing: 25000,

    connectHeaders: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},

    webSocketFactory: () => new SockJS(getWebSocketUrl()),

    beforeConnect: () => {
      onStatusChange?.(
        hasConnected ? "Reconnecting" : "Connecting",
      );
    },

    onConnect: () => {
      hasConnected = true;
      onStatusChange?.("Connected");

      client.subscribe(
        `/topic/groups/${groupId}/messages`,
        (frame) => {
          try {
            onMessage(
              JSON.parse(frame.body) as GroupMessage,
            );
          } catch (error) {
            console.error(
              "Invalid WebSocket message payload",
              error,
            );
          }
        },
      );
    },

    onDisconnect: () => {
      onStatusChange?.("Disconnected");
    },

    onWebSocketClose: () => {
      onStatusChange?.(
        client.active ? "Reconnecting" : "Disconnected",
      );
    },

    onStompError: (frame) => {
      console.error("STOMP error", frame);

      onStatusChange?.(
        frame.headers.message ?? "Connection rejected",
      );
    },

    onWebSocketError: (error) => {
      console.error("WebSocket error", error);
      onStatusChange?.("WebSocket error");
    },
  });

  return client;
}

export function publishGroupMessage(
  client: Client,
  groupId: string,
  message: CreateGroupMessageRequest,
): void {
  if (!client.connected) {
    throw new Error("WebSocket client is not connected");
  }

  client.publish({
    destination: `/app/groups/${groupId}/messages`,
    body: JSON.stringify(message),
  });
}