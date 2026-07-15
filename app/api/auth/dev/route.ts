import { NextRequest, NextResponse } from "next/server";

import { authenticateWithBackend } from "@/lib/auth/server-auth";
import {
  forbiddenResponse,
  isTrustedBrowserRequest,
} from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_DEV_LOGIN !== "true"
  ) {
    return NextResponse.json(
      {
        code: "NOT_FOUND",
        message: "Not found.",
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (!isTrustedBrowserRequest(request)) {
    return forbiddenResponse();
  }

  return authenticateWithBackend(request, [
    "auth",
    "dev-login",
  ]);
}
