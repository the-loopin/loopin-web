import { NextRequest, NextResponse } from "next/server";

import { clearServerSession } from "@/lib/auth/server-session";
import {
  forbiddenResponse,
  isTrustedBrowserRequest,
} from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isTrustedBrowserRequest(request)) {
    return forbiddenResponse();
  }

  const response = NextResponse.json(
    { loggedOut: true },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
        "Clear-Site-Data": '"cache"',
      },
    },
  );

  clearServerSession(response);
  return response;
}
