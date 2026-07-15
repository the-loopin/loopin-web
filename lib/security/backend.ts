const DEVELOPMENT_API_BASE_URL =
  "http://localhost:8080/api/v1";

function normalizeApiPath(pathname: string): string {
  const withoutTrailingSlash = pathname.replace(/\/+$/, "");

  if (withoutTrailingSlash.endsWith("/api")) {
    return `${withoutTrailingSlash}/v1`;
  }

  return withoutTrailingSlash;
}

export function getBackendApiBaseUrl(): URL {
  const configuredUrl =
    process.env.API_INTERNAL_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : DEVELOPMENT_API_BASE_URL);

  if (!configuredUrl) {
    throw new Error(
      "API_INTERNAL_BASE_URL must be configured in production.",
    );
  }

  const url = new URL(configuredUrl);

  if (url.username || url.password) {
    throw new Error(
      "Backend API URL must not contain embedded credentials.",
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "Backend API URL must use HTTPS in production.",
    );
  }

  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("Backend API URL has an invalid protocol.");
  }

  url.pathname = normalizeApiPath(url.pathname);
  url.search = "";
  url.hash = "";

  return url;
}

export function buildBackendApiUrl(
  pathSegments: string[],
  search = "",
): URL {
  if (
    pathSegments.length === 0 ||
    pathSegments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\") ||
        segment.includes("\0"),
    )
  ) {
    throw new Error("Invalid backend API path.");
  }

  const baseUrl = getBackendApiBaseUrl();
  const encodedPath = pathSegments
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  baseUrl.pathname = `${baseUrl.pathname}/${encodedPath}`;
  baseUrl.search = search;

  return baseUrl;
}
