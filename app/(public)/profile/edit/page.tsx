"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlignLeft, MapPin, User } from "lucide-react";

import { getProfile, updateProfile } from "@/lib/api";

import {
  ErrorMessage,
  Input,
  SiteShell,
  Textarea,
} from "../../../site";

type ProfileForm = {
  name: string;
  city: string;
  bio: string;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    city: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();

        setForm({
          name: profile.name ?? "",
          city: profile.city ?? "",
          bio: profile.bio ?? "",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await updateProfile(form);
      router.push("/profile");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SiteShell>
        <div className="prototype-shell flex min-h-screen items-center justify-center">
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--color-muted)" }}
          >
            Loading profile...
          </p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="prototype-shell min-h-screen p-6">

        <div
          className="mx-auto mb-8 flex max-w-3xl flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <Link
              href="/profile"
              className="mb-2 inline-flex items-center gap-2 text-xs font-bold hover:underline"
              style={{ color: "var(--color-coral)" }}
            >
              <ArrowLeft size={14} />
              Back to Profile
            </Link>

            <h1
              className="text-3xl font-black"
              style={{ color: "var(--color-ink)" }}
            >
              Edit Profile
            </h1>

            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-muted)" }}
            >
              Update your personal information.
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-auto mb-6 max-w-3xl">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="mx-auto max-w-3xl">
          <div className="sidebar-panel rounded-xl p-6">
            <form
              className="flex flex-col gap-6"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    className="flex items-center gap-2 text-sm font-bold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    <User
                      size={16}
                      style={{ color: "var(--color-coral)" }}
                    />
                    Full Name
                  </label>

                  <Input
                    label=""
                    value={form.name}
                    required
                    onChange={(name) =>
                      setForm((prev) => ({
                        ...prev,
                        name,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="flex items-center gap-2 text-sm font-bold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    <MapPin
                      size={16}
                      style={{ color: "var(--color-coral)" }}
                    />
                    City
                  </label>

                  <Input
                    label=""
                    value={form.city}
                    required
                    onChange={(city) =>
                      setForm((prev) => ({
                        ...prev,
                        city,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="flex items-center gap-2 text-sm font-bold"
                  style={{ color: "var(--color-ink)" }}
                >
                  <AlignLeft
                    size={16}
                    style={{ color: "var(--color-coral)" }}
                  />
                  Biography
                </label>

                <Textarea
                  label=""
                  value={form.bio}
                  onChange={(bio) =>
                    setForm((prev) => ({
                      ...prev,
                      bio,
                    }))
                  }
                />

                <span
                  className="text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  Tell other users something about yourself.
                </span>
              </div>

              <div
                className="mt-2 flex items-center justify-end gap-4 border-t pt-6"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Link
                  href="/profile"
                  className="rounded-lg px-5 py-2.5 text-sm font-bold no-underline transition-colors"
                  style={{
                    color: "var(--color-ink)",
                    background:
                      "color-mix(in srgb, var(--color-ink) 5%, transparent)",
                  }}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: "var(--color-coral)",
                  }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}