import axios from "axios";
import {
  clearAuthToken,
  getAuthToken,
} from "../auth/session";
import { ApiException } from "./errors";

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "/api";
const apiBaseUrl = configuredBaseUrl.endsWith("/api") ? `${configuredBaseUrl}/v1` : configuredBaseUrl;

function isAuthenticationRequest(
  requestUrl: string | undefined,
): boolean {
  if (!requestUrl) {
    return false;
  }

  return requestUrl.startsWith("/auth/") || requestUrl.startsWith("auth/");
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const isAuthRequest = isAuthenticationRequest(config.url);

  if (!isAuthRequest) {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = isAuthenticationRequest(
      error?.config?.url,
    );

    const status = error?.response?.status ?? 500;
    const responseData = error?.response?.data;
    
    const fallbackCodeByStatus: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      429: "RATE_LIMITED",
      500: "INTERNAL_SERVER_ERROR",
    };

    // Default error details
    let message = error.message ?? "An unexpected error occurred";
    let code = fallbackCodeByStatus[status] ?? "UNKNOWN_ERROR";
    let fieldErrors: Record<string, string> | undefined;

    if (responseData && typeof responseData === "object") {
      message = responseData.message ?? responseData.detail ?? message;
      code = responseData.error ?? responseData.code ?? code;
      fieldErrors = responseData.fieldErrors;
    }

    const normalizedError = new ApiException({
      status,
      code,
      message,
      fieldErrors,
      details: responseData,
      cause: error,
    });

    if (
      status === 401 &&
      !isAuthRequest &&
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