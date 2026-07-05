"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "@/lib/api/loopin";
import { ErrorMessage, Input, PageHeader, Panel, SiteShell, Textarea } from "../../../site";

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "Test User", city: "Baku", bio: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const profile = await getProfile();
        setForm({
          name: profile.name ?? "Test User",
          city: profile.city ?? "Baku",
          bio: profile.bio ?? "",
        });
      } catch {
        setError("Could not load profile. You can still try saving.");
      }
    }
    void load();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await updateProfile(form);
      router.push("/profile");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update profile.");
    }
  }

  return (
    <SiteShell>
      <PageHeader title="Edit profile" />
      <ErrorMessage message={error} />
      <Panel>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Name" value={form.name} onChange={(name) => setForm((c) => ({ ...c, name }))} required />
            <Input label="City" value={form.city} onChange={(city) => setForm((c) => ({ ...c, city }))} required />
          </div>
          <Textarea label="Bio" value={form.bio} onChange={(bio) => setForm((c) => ({ ...c, bio }))} />
          <button className="primary-button" type="submit">Save profile</button>
        </form>
      </Panel>
    </SiteShell>
  );
}
