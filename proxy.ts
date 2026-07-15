import { NextRequest, NextResponse } from "next/server";

import {
  SESSION_ROLE_COOKIE_NAME,
  SESSION_TOKEN_COOKIE_NAME,
} from "./lib/auth/constants";
import { hasRequiredRole } from "./lib/auth/middleware";

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(
    SESSION_TOKEN_COOKIE_NAME,
  )?.value;
  const role = request.cookies.get(
    SESSION_ROLE_COOKIE_NAME,
  )?.value;

  if (!token || !hasRequiredRole(role, ["ADMIN"])) {
    return redirectToLogin(request);
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
