import axios from "axios";
import {
  clearAuthToken,
  getAuthToken,
} from "../auth/session";

function isAuthenticationRequest(
  requestUrl: string | undefined,
): boolean {
  if (!requestUrl) {
    return false;
  }

  return requestUrl.startsWith("/auth/");
}

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "/api",
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

    if (
      error?.response?.status === 401 &&
      !isAuthRequest &&
      typeof window !== "undefined"
    ) {
      clearAuthToken();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;