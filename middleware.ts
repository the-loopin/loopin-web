import { NextRequest, NextResponse } from "next/server";
import { hasRequiredRole } from "./lib/auth/middleware";
import { SESSION_TOKEN_COOKIE_NAME } from "./lib/auth/session";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(
    SESSION_TOKEN_COOKIE_NAME,
  )?.value;

  const role = request.cookies.get("loopin-role")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!hasRequiredRole(role, ["ADMIN"])) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};