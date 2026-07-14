"use client";

import { type FormEvent, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Trash2,
  User,
  Info,
  Heart,
  Save,
  X
} from "lucide-react";

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

  // Alert before leaving if there are unsaved changes
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
      // 1. Update basic profile info
      await updateProfile({
        name: form.name.trim(),
        city: form.city.trim(),
        bio: form.bio.trim() || undefined,
      });
      
      // 2. Update interests if changed
      const interestsChanged = 
        selectedInterestIds.length !== initialInterestIds.length || 
        !selectedInterestIds.every(id => initialInterestIds.includes(id));
        
      if (interestsChanged) {
        await updateMyInterests(selectedInterestIds);
      }

      // 3. Update avatar
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
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-sm font-medium animate-pulse" style={{ color: "var(--color-muted)" }}>
            Loading your information...
          </p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <form onSubmit={handleSubmit} className="relative min-h-screen pb-32">
        <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/profile"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[var(--color-coral)]"
                style={{ color: "var(--color-muted)" }}
              >
                <ArrowLeft size={16} />
                Back to Profile
              </Link>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
                Edit Profile
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--color-muted)" }}>
                Update your personal information, avatar, and interests.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-8">
              <ErrorMessage message={error} />
            </div>
          )}

          <div className="flex flex-col gap-10">
            {/* AVATAR SECTION */}
            <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 border-b border-[var(--line)] pb-4">
                <ImagePlus size={18} style={{ color: "var(--color-coral)" }} />
                <h2 className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>Profile Avatar</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pt-2">
                <div className="relative group shrink-0">
                  {avatarPreviewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className="h-28 w-28 rounded-full object-cover border-2 border-[var(--line)]"
                      src={avatarPreviewUrl}
                      alt="Avatar preview"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-full border-2 border-dashed border-[var(--line)] bg-[var(--background)] flex items-center justify-center text-[var(--color-muted)]">
                      <User size={32} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer rounded-xl bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-ink)_8%,transparent)] px-4 py-2 text-sm font-semibold transition-colors">
                      <span style={{ color: "var(--color-ink)" }}>Upload Image</span>
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        type="file"
                        className="hidden"
                        onChange={(e) => selectAvatar(e.target.files?.[0] ?? null)}
                      />
                    </label>

                    {(avatarFile || (currentAvatarId && !removeAvatarRequested)) && (
                      <button
                        type="button"
                        onClick={() => {
                          selectAvatar(null);
                          if (currentAvatarId) setRemoveAvatarRequested(true);
                        }}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    Recommended size: 400x400px. Max size 2MB.
                  </p>
                </div>
              </div>
            </section>

            {/* BASIC INFORMATION SECTION */}
            <section className="flex flex-col gap-6 rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 border-b border-[var(--line)] pb-4">
                <Info size={18} style={{ color: "var(--color-coral)" }} />
                <h2 className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>Basic Information</h2>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 pt-2">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                    Full Name
                  </label>
                  <Input
                    label=""
                    value={form.name}
                    required
                    onChange={(name) => setForm((curr) => ({ ...curr, name }))}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                    City
                  </label>
                  <Input
                    label=""
                    value={form.city}
                    required
                    onChange={(city) => setForm((curr) => ({ ...curr, city }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                  <span>Biography</span>
                  <span className="text-xs font-normal" style={{ color: "var(--color-muted)" }}>{form.bio.length} / 160</span>
                </label>
                <Textarea
                  label=""
                  value={form.bio}
                  onChange={(bio) => setForm((curr) => ({ ...curr, bio }))}
                />
              </div>
            </section>

            {/* INTERESTS SECTION */}
            <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 border-b border-[var(--line)] pb-4">
                <Heart size={18} style={{ color: "var(--color-coral)" }} />
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>Interests</h2>
                  <p className="text-xs font-medium mt-1" style={{ color: "var(--color-muted)" }}>
                    Select topics you&apos;re interested in to get better recommendations.
                  </p>
                </div>
              </div>
              
              <div className="pt-2">
                <InterestsSelector 
                  selectedIds={selectedInterestIds}
                  onChange={setSelectedInterestIds}
                />
              </div>
            </section>
          </div>
        </div>

        {/* STICKY ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)] bg-[var(--panel)]/80 backdrop-blur-xl px-4 py-4 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 sm:justify-end">
            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)]"
              style={{ color: "var(--color-ink)" }}
            >
              <X size={16} />
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-[var(--color-coral)]/20"
              style={{ background: "var(--color-coral)" }}
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </SiteShell>
  );
}
