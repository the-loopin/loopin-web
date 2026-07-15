import { NextRequest } from "next/server";

import { authenticateWithBackend } from "@/lib/auth/server-auth";
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

  return authenticateWithBackend(request, ["auth", "google"]);
}
