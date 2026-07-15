import { NextRequest, NextResponse } from "next/server";

import { getServerAuthToken } from "@/lib/auth/server-session";
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

  const token = await getServerAuthToken();

  if (!token) {
    return NextResponse.json(
      {
        code: "UNAUTHORIZED",
        message: "Authentication is required.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
          Vary: "Cookie",
        },
      },
    );
  }

  return NextResponse.json(
    { token },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
        Vary: "Cookie",
      },
    },
  );
}
