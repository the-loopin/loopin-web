"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProfile, updateProfile } from "@/lib/api/loopin";
import { User, MapPin, AlignLeft, ArrowLeft } from "lucide-react";
import { ErrorMessage, Input, PageHeader, Panel, SiteShell, Textarea } from "../../../site";

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "Test User", city: "Baku", bio: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await updateProfile(form);
      router.push("/profile");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteShell>
      <div className="prototype-shell p-6 min-h-screen">
        
        {/* Səhifə Başlığı və Geri Qayıtmaq Linki */}
        <div className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href="/profile" 
                className="inline-flex items-center gap-1 text-xs font-bold no-underline hover:underline transition-all"
                style={{ color: "var(--color-coral)" }}
              >
                <ArrowLeft size={14} /> Back to Workspace
              </Link>
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-ink)" }}>Edit Profile</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Update your identity details, location, and write something about yourself.
            </p>
          </div>
        </div>

        {/* Xəta Mesajı Paneli */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Redaktə Formu Paneli */}
        <div className="max-w-3xl mx-auto">
          <div className="sidebar-panel p-6 rounded-xl">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              
              {/* Ad və Şəhər Girişləri (İki sütunlu yan-yana düzülüş) */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                    <User size={16} style={{ color: "var(--color-coral)" }} />
                    Full Name
                  </label>
                  <Input 
                    label="" 
                    value={form.name} 
                    onChange={(name) => setForm((c) => ({ ...c, name }))} 
                    required 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                    <MapPin size={16} style={{ color: "var(--color-coral)" }} />
                    City / Location
                  </label>
                  <Input 
                    label="" 
                    value={form.city} 
                    onChange={(city) => setForm((c) => ({ ...c, city }))} 
                    required 
                  />
                </div>
              </div>

              {/* Bioqrafiya Girişi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                  <AlignLeft size={16} style={{ color: "var(--color-coral)" }} />
                  Biography
                </label>
                <Textarea 
                  label="" 
                  value={form.bio} 
                  onChange={(bio) => setForm((c) => ({ ...c, bio }))} 
                />
                <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Briefly describe your goals, interests, or what you work on.
                </span>
              </div>

              {/* Hərəkət Düymələri (Yadda Saxla və İmtina) */}
              <div className="flex items-center justify-end gap-4 border-t pt-6 mt-2" style={{ borderColor: "var(--color-border)" }}>
                <Link 
                  href="/profile" 
                  className="px-5 py-2.5 rounded-lg text-sm font-bold no-underline transition-colors"
                  style={{ color: "var(--color-ink)", background: "color-mix(in srgb, var(--color-ink) 5%, transparent)" }}
                >
                  Cancel
                </Link>
                
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer" 
                  style={{ background: "var(--color-coral)" }}
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </SiteShell>
  );
}