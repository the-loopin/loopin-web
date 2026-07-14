"use client";

import axios from "axios";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { googleLogin } from "@/lib/api";
import {
  setAuthRole,
  setAuthToken,
} from "@/lib/auth/session";

type AuthMode = "login" | "register";

type ApiErrorBody = {
  message?: string;
  detail?: string;
  error?: string;
};

let initializedClientId: string | null = null;

let activeCredentialHandler:
  | ((response: GoogleCredentialResponse) => void)
  | null = null;

export function GoogleIdentityButton({
  mode,
}: {
  mode: AuthMode;
}) {
  const router = useRouter();

  const buttonContainerRef =
    useRef<HTMLDivElement>(null);

  const [scriptReady, setScriptReady] =
    useState(false);

  const [isAuthenticating, setIsAuthenticating] =
    useState(false);

  const [error, setError] = useState("");

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError(
          "Google did not return an ID token.",
        );
        return;
      }

      setError("");
      setIsAuthenticating(true);

      try {
        const authResponse = await googleLogin(
          response.credential,
        );

        if (!authResponse.token || !authResponse.role) {
          throw new Error("Invalid authentication response received.");
        }
        setAuthToken(authResponse.token);
        setAuthRole(authResponse.role);

        router.replace("/events");
        router.refresh();
      } catch (caught) {
        if (axios.isAxiosError<ApiErrorBody>(caught)) {
          const responseMessage =
            caught.response?.data?.message ??
            caught.response?.data?.detail ??
            caught.response?.data?.error;

          setError(
            responseMessage ??
              "Google authentication failed.",
          );
        } else {
          setError(
            "Google authentication failed.",
          );
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (
      !scriptReady ||
      !clientId ||
      !buttonContainerRef.current
    ) {
      return;
    }

    const googleIdentity =
      window.google?.accounts.id;

    if (!googleIdentity) {
      return;
    }

    activeCredentialHandler = handleCredential;

    if (initializedClientId !== clientId) {
      googleIdentity.initialize({
        client_id: clientId,
        ux_mode: "popup",
        auto_select: false,
        callback: (response) => {
          activeCredentialHandler?.(response);
        },
      });

      initializedClientId = clientId;
    }

    /*
     * Prevent duplicate button creation during
     * React development rendering.
     */
    buttonContainerRef.current.replaceChildren();

    googleIdentity.renderButton(
      buttonContainerRef.current,
      {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        logo_alignment: "left",
        width: 340,
        text:
          mode === "register"
            ? "signup_with"
            : "signin_with",
      },
    );

    return () => {
      if (
        activeCredentialHandler ===
        handleCredential
      ) {
        activeCredentialHandler = null;
      }
    };
  }, [
    clientId,
    handleCredential,
    mode,
    scriptReady,
  ]);

  return (
    <div className="grid gap-4">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => {
          if (!window.google?.accounts.id) {
            setError(
              "Google authentication could not be loaded.",
            );
            return;
          }

          setError("");
          setScriptReady(true);
        }}
        onError={() => {
          setError(
            "Google authentication script could not be loaded.",
          );
        }}
      />

      {!clientId ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          NEXT_PUBLIC_GOOGLE_CLIENT_ID is not
          configured.
        </p>
      ) : null}

      <div className="relative flex min-h-11 justify-center">
        <div ref={buttonContainerRef} />

        {isAuthenticating ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/80">
            <LoaderCircle
              className="animate-spin text-white"
              size={22}
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}