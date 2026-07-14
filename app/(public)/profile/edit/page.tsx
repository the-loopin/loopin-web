"use client";

import { type FormEvent, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlignLeft, ArrowLeft, ImagePlus, MapPin, Trash2, User } from "lucide-react";

import {
  getProfile,
  removeProfileAvatar,
  updateProfile,
  updateProfileAvatar,
  updateMyInterests
} from "@/lib/api";
import { withUploadedMedia } from "@/lib/media/withUploadedMedia";

import { ErrorMessage, Input, SiteShell, Textarea } from "../../../site";
import { InterestsSelector } from "@/components/ui/InterestsSelector";

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

  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [initialInterestIds, setInitialInterestIds] = useState<string[]>([]);
  const [initialForm, setInitialForm] = useState<ProfileForm | null>(null);

  const [currentAvatarId, setCurrentAvatarId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [removeAvatarRequested, setRemoveAvatarRequested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();

        const loadedForm = {
          name: profile.name ?? "",
          city: profile.city ?? "",
          bio: profile.bio ?? "",
        };

        setForm(loadedForm);
        setInitialForm(loadedForm);

        setCurrentAvatarId(profile.avatar?.id ?? null);

        const interestIds = profile.interests?.map(i => i.id || "").filter(Boolean) || [];
        setSelectedInterestIds(interestIds);
        setInitialInterestIds(interestIds);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  function selectAvatar(file: File | null) {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarFile(file);
    setAvatarPreviewUrl(file ? URL.createObjectURL(file) : "");

    if (file) {
      setRemoveAvatarRequested(false);
    }
  }

  const hasChanges = useMemo(() => {
    if (!initialForm) return false;
    const formChanged = 
      form.name !== initialForm.name || 
      form.city !== initialForm.city || 
      form.bio !== initialForm.bio;
    const avatarChanged = avatarFile !== null || removeAvatarRequested;
    const interestsChanged = 
      selectedInterestIds.length !== initialInterestIds.length || 
      !selectedInterestIds.every(id => initialInterestIds.includes(id));
    return formChanged || avatarChanged || interestsChanged;
  }, [form, initialForm, avatarFile, removeAvatarRequested, selectedInterestIds, initialInterestIds]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !saving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, saving]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasChanges) return;

    setSaving(true);
    setError("");

    try {
      await updateProfile({
        name: form.name.trim(),
        city: form.city.trim(),
        bio: form.bio.trim() || undefined,
      });

      const interestsChanged = 
        selectedInterestIds.length !== initialInterestIds.length || 
        !selectedInterestIds.every(id => initialInterestIds.includes(id));
      
      if (interestsChanged) {
        await updateMyInterests(selectedInterestIds);
      }

      if (removeAvatarRequested) {
        await removeProfileAvatar();
      } else if (avatarFile) {
        await withUploadedMedia({
          file: avatarFile,
          purpose: "PROFILE_AVATAR",
          commit: (mediaId) => {
            if (!mediaId) {
              throw new Error("Avatar upload did not return a media ID.");
            }
            return updateProfileAvatar(mediaId);
          },
        });
      }

      router.push("/profile");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to update profile."
      );
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SiteShell>
        <div className="prototype-shell flex min-h-screen items-center justify-center">
          <p
            className="text-lg font-semibold"
            style={{
              color:
                "var(--color-muted)",
            }}
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
          style={{
            borderColor:
              "var(--color-border)",
          }}
        >
          <div>
            <Link
              href="/profile"
              className="mb-2 inline-flex items-center gap-2 text-xs font-bold hover:underline"
              style={{
                color:
                  "var(--color-coral)",
              }}
            >
              <ArrowLeft size={14} />
              Back to Profile
            </Link>

            <h1
              className="text-3xl font-black"
              style={{
                color:
                  "var(--color-ink)",
              }}
            >
              Edit Profile
            </h1>

            <p
              className="mt-1 text-sm"
              style={{
                color:
                  "var(--color-muted)",
              }}
            >
              Update your personal information
              and avatar.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mx-auto mb-6 max-w-3xl">
            <ErrorMessage
              message={error}
            />
          </div>
        ) : null}

        <div className="mx-auto max-w-3xl">
          <div className="sidebar-panel rounded-xl p-6">
            <form
              className="flex flex-col gap-6"
              onSubmit={handleSubmit}
            >
              <section className="grid gap-3 rounded-xl border border-[var(--line)] p-4">
                <div className="flex items-center gap-2">
                  <ImagePlus
                    size={18}
                    style={{
                      color:
                        "var(--color-coral)",
                    }}
                  />

                  <strong>
                    Profile avatar
                  </strong>
                </div>

                {avatarPreviewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="h-32 w-32 rounded-2xl object-cover"
                      src={avatarPreviewUrl}
                      alt="Avatar preview"
                    />
                  </>
                ) : null}

                {currentAvatarId &&
                !removeAvatarRequested ? (
                  <p
                    className="text-xs"
                    style={{
                      color:
                        "var(--color-muted)",
                    }}
                  >
                    Attached media:{" "}
                    {currentAvatarId}
                  </p>
                ) : null}

                <input
                  accept="image/jpeg,image/png,image/webp"
                  type="file"
                  onChange={(changeEvent) =>
                    selectAvatar(
                      changeEvent.target
                        .files?.[0] ??
                        null,
                    )
                  }
                />

                <div className="flex flex-wrap gap-2">
                  {avatarFile ? (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() =>
                        selectAvatar(null)
                      }
                    >
                      Clear selected avatar
                    </button>
                  ) : null}

                  {currentAvatarId &&
                  !removeAvatarRequested ? (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => {
                        selectAvatar(null);
                        setRemoveAvatarRequested(
                          true,
                        );
                      }}
                    >
                      <Trash2 size={15} />
                      Remove avatar
                    </button>
                  ) : null}

                  {removeAvatarRequested ? (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() =>
                        setRemoveAvatarRequested(
                          false,
                        )
                      }
                    >
                      Keep current avatar
                    </button>
                  ) : null}
                </div>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    className="flex items-center gap-2 text-sm font-bold"
                    style={{
                      color:
                        "var(--color-ink)",
                    }}
                  >
                    <User
                      size={16}
                      style={{
                        color:
                          "var(--color-coral)",
                      }}
                    />
                    Full Name
                  </label>

                  <Input
                    label=""
                    value={form.name}
                    required
                    onChange={(name) =>
                      setForm(
                        (current) => ({
                          ...current,
                          name,
                        }),
                      )
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="flex items-center gap-2 text-sm font-bold"
                    style={{
                      color:
                        "var(--color-ink)",
                    }}
                  >
                    <MapPin
                      size={16}
                      style={{
                        color:
                          "var(--color-coral)",
                      }}
                    />
                    City
                  </label>

                  <Input
                    label=""
                    value={form.city}
                    required
                    onChange={(city) =>
                      setForm(
                        (current) => ({
                          ...current,
                          city,
                        }),
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="flex items-center gap-2 text-sm font-bold"
                  style={{
                    color:
                      "var(--color-ink)",
                  }}
                >
                  <AlignLeft
                    size={16}
                    style={{
                      color:
                        "var(--color-coral)",
                    }}
                  />
                  Biography
                </label>

                <Textarea
                  label=""
                  value={form.bio}
                  onChange={(bio) =>
                    setForm(
                      (current) => ({
                        ...current,
                        bio,
                      }),
                    )
                  }
                />

                <span
                  className="text-xs"
                  style={{
                    color:
                      "var(--color-muted)",
                  }}
                >
                  Tell other users something
                  about yourself.
                </span>
              </div>

              <div
                className="mt-2 flex items-center justify-end gap-4 border-t pt-6"
                style={{
                  borderColor:
                    "var(--color-border)",
                }}
              >
                <Link
                  href="/profile"
                  className="rounded-lg px-5 py-2.5 text-sm font-bold no-underline transition-colors"
                  style={{
                    color:
                      "var(--color-ink)",
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
                    background:
                      "var(--color-coral)",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
