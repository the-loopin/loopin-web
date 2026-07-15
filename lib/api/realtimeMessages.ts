"use client";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getWebSocketAuthToken } from "../auth/session";
import { normalizeApiIdentifier } from "./path";
import type {
  CreateGroupMessageRequest,
  GroupMessage,
} from "../types/message";

function getConfiguredWebSocketUrl(): string {
  const configuredWebSocketUrl =
    process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  const configuredApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL;

  if (configuredWebSocketUrl) {
    return configuredWebSocketUrl;
  }

  if (configuredApiUrl) {
    const apiUrl = configuredApiUrl.replace(/\/+$/, "");
    return `${apiUrl.replace(/\/v1$/, "")}/ws`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_WEBSOCKET_URL must be configured in production",
    );
  }

  return "http://localhost:8080/api/ws";
}

function getWebSocketUrl(): string {
  const url = new URL(getConfiguredWebSocketUrl());

  if (url.username || url.password) {
    throw new Error(
      "WebSocket URL must not contain embedded credentials",
    );
  }

  if (url.protocol === "ws:") {
    url.protocol = "http:";
  } else if (url.protocol === "wss:") {
    url.protocol = "https:";
  }

  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("WebSocket URL has an invalid protocol");
  }

  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "WebSocket URL must use HTTPS in production",
    );
  }

  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function createGroupMessageClient(
  groupId: string,
  onMessage: (message: GroupMessage) => void,
  onStatusChange?: (status: string) => void,
): Client {
  const safeGroupId = normalizeApiIdentifier(groupId, "groupId");
  let hasConnected = false;

  const client = new Client({
    reconnectDelay: 3000,
    heartbeatIncoming: 25000,
    heartbeatOutgoing: 25000,
    connectHeaders: {},
    webSocketFactory: () => new SockJS(getWebSocketUrl()),

    beforeConnect: async () => {
      onStatusChange?.(
        hasConnected ? "Reconnecting" : "Connecting",
      );

      const token = await getWebSocketAuthToken();
      client.connectHeaders = {
        Authorization: `Bearer ${token}`,
      };
    },

    onConnect: () => {
      hasConnected = true;
      onStatusChange?.("Connected");

      client.subscribe(
        `/topic/groups/${safeGroupId}/messages`,
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
      client.connectHeaders = {};
      onStatusChange?.(
        client.active ? "Reconnecting" : "Disconnected",
      );
    },

    onStompError: (frame) => {
      client.connectHeaders = {};
      console.error("STOMP error", frame);

      onStatusChange?.(
        frame.headers.message ?? "Connection rejected",
      );
    },

    onWebSocketError: (error) => {
      client.connectHeaders = {};
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

  const safeGroupId = normalizeApiIdentifier(groupId, "groupId");

  client.publish({
    destination: `/app/groups/${safeGroupId}/messages`,
    body: JSON.stringify(message),
  });
}
