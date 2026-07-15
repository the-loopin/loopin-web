import axios from "axios";

import { clearAuthToken } from "../auth/session";
import { ApiException } from "./errors";

const fallbackCodeByStatus: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  429: "RATE_LIMITED",
  500: "INTERNAL_SERVER_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

function isSafeRelativeApiPath(
  requestUrl: string | undefined,
): boolean {
  if (!requestUrl) {
    return true;
  }

  const normalizedUrl = requestUrl.trim();

  return (
    normalizedUrl === requestUrl &&
    normalizedUrl.startsWith("/") &&
    !normalizedUrl.startsWith("//") &&
    !/^[a-z][a-z\d+.-]*:/i.test(normalizedUrl) &&
    !normalizedUrl.includes("\\") &&
    !normalizedUrl.includes("#") &&
    !/[\u0000-\u001F\u007F]/.test(normalizedUrl)
  );
}

function getSafeString(
  value: unknown,
  fallback: string,
  maxLength: number,
): string {
  return typeof value === "string" && value.length > 0
    ? value.slice(0, maxLength)
    : fallback;
}

const apiClient = axios.create({
  baseURL:
    process.env.NODE_ENV === "test"
      ? "/api/v1"
      : "/api/backend",
  timeout: 30_000,
  withCredentials: true,
  allowAbsoluteUrls: false,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

apiClient.interceptors.request.use((config) => {
  if (!isSafeRelativeApiPath(config.url)) {
    throw new ApiException({
      status: 400,
      code: "INVALID_API_URL",
      message: "Absolute or protocol-relative API URLs are not allowed.",
    });
  }

  config.headers.delete?.("Authorization");
  delete config.headers.Authorization;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error instanceof ApiException) {
      return Promise.reject(error);
    }

    const status = error?.response?.status ?? 500;
    const responseData = error?.response?.data;
    let message = getSafeString(
      error?.message,
      "An unexpected error occurred",
      300,
    );
    let code =
      fallbackCodeByStatus[status] ?? "UNKNOWN_ERROR";
    let fieldErrors: Record<string, string> | undefined;

    if (responseData && typeof responseData === "object") {
      const body = responseData as Record<string, unknown>;
      message = getSafeString(
        body.message ?? body.detail,
        message,
        300,
      );
      code = getSafeString(
        body.error ?? body.code,
        code,
        80,
      );

      if (
        body.fieldErrors &&
        typeof body.fieldErrors === "object"
      ) {
        fieldErrors = body.fieldErrors as Record<
          string,
          string
        >;
      }
    }

    const normalizedError = new ApiException({
      status,
      code,
      message,
      fieldErrors,
      details:
        process.env.NODE_ENV === "development"
          ? responseData
          : undefined,
      cause:
        process.env.NODE_ENV === "development"
          ? error
          : undefined,
    });

    if (
      status === 401 &&
      typeof window !== "undefined"
    ) {
      clearAuthToken();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
