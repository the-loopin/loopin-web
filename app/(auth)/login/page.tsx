"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorMessage, Input, PageHeader, Panel, SiteShell, Textarea } from "../../site";
import { devLogin, googleLogin } from "@/lib/api/loopin";
import { setAuthRole, setAuthToken } from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("leo.test@loopin.local");
  const [name, setName] = useState("Leo Test");
  const [token, setToken] = useState("");
  const [role, setRole] = useState("USER");
  const [googleIdToken, setGoogleIdToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function saveSession(nextToken: string, nextRole: string) {
    setAuthToken(nextToken);
    setAuthRole(nextRole);
    router.push("/events");
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await devLogin({ email, name, role });
      setMessage(`Signed in as ${response.email}.`);
      saveSession(response.token, response.role);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in test user.");
    }
  }

  function handleTokenLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) {
      setError("Paste a JWT token first.");
      return;
    }
    saveSession(token.trim(), role);
  }

  async function handleGoogleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await googleLogin(googleIdToken);
      saveSession(response.token, response.role);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google login failed.");
    }
  }

  return (
    <SiteShell>
      <PageHeader
        title="Sign in to Loopin"
        subtitle="Use local test sign-in while developing, or paste a JWT / Google token when needed."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Local test sign-in">
          <form className="grid gap-3" onSubmit={handleRegister}>
            <Input label="Email" value={email} onChange={setEmail} required />
            <Input label="Name" value={name} onChange={setName} required />
            <Input label="Role" value={role} onChange={setRole} />
            <button className="primary-button" type="submit">Sign in locally</button>
          </form>
        </Panel>

        <Panel title="Continue with JWT">
          <form className="grid gap-3" onSubmit={handleTokenLogin}>
            <Textarea label="JWT token" value={token} onChange={setToken} required />
            <Input label="Role for frontend guard" value={role} onChange={setRole} />
            <button className="primary-button" type="submit">Save session</button>
          </form>
        </Panel>

        <Panel title="Google OAuth token">
          <form className="grid gap-3" onSubmit={handleGoogleLogin}>
            <Textarea label="Google ID token" value={googleIdToken} onChange={setGoogleIdToken} required />
            <button className="primary-button" type="submit">Login with Google</button>
          </form>
        </Panel>
      </div>
      {message ? <p className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p> : null}
      <div className="mt-4"><ErrorMessage message={error} /></div>
    </SiteShell>
  );
}