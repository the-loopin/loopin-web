"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getBadges,
  getCurrentUser,
  getProfile,
  getMyGroups,
  getSettings,
  updateSettings,
  getAvailableInterests,
  getMyInterests,
  updateMyInterests,
  ProfilePayload,
  UserItem,
  GroupItem,
  UserSettings,
  InterestItem,
} from "@/lib/api/loopin";
import { User, MapPin, Mail, Calendar, Award, Users, CheckCircle2, Sparkles, Flag, Settings, Bell, Eye } from "lucide-react";
import { SiteShell } from "../../site";

export default function CompleteProfilePage() {
  const router = useRouter();

  // States for live database data
  const [user, setUser] = useState<UserItem | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Preference settings - loaded from the database
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    publicProfile: true,
  });
  const [savingSetting, setSavingSetting] = useState<keyof UserSettings | null>(null);

  // Active Groups - loaded from the database
  const [groups, setGroups] = useState<GroupItem[]>([]);

  // Interests - loaded from the database
  const [availableInterests, setAvailableInterests] = useState<InterestItem[]>([]);
  const [myInterestIds, setMyInterestIds] = useState<string[]>([]);
  const [savingInterestId, setSavingInterestId] = useState<string | null>(null);

  // Fetch real data from database on mount
  async function loadProfileData() {
    setLoading(true);
    setError("");
    try {
      const [nextUser, nextProfile, nextBadges, nextGroups, nextSettings, nextAvailableInterests, nextMyInterests] = await Promise.all([
        getCurrentUser(),
        getProfile(),
        getBadges(),
        getMyGroups(),
        getSettings(),
        getAvailableInterests(),
        getMyInterests(),
      ]);
      setUser(nextUser);
      setProfile(nextProfile);
      setBadges(nextBadges);
      setGroups(nextGroups);
      setSettings(nextSettings);
      setAvailableInterests(nextAvailableInterests);
      setMyInterestIds(nextMyInterests);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load profile data.");
    } finally {
      setLoading(false);
    }
  }

  // Toggle a single interest on/off
  async function handleInterestToggle(interestId: string) {
    const wasSelected = myInterestIds.includes(interestId);
    const next = wasSelected
      ? myInterestIds.filter((id) => id !== interestId)
      : [...myInterestIds, interestId];
    setMyInterestIds(next);
    setSavingInterestId(interestId);
    try {
      await updateMyInterests(next);
    } catch (caught) {
      setMyInterestIds(myInterestIds);
      setError(caught instanceof Error ? caught.message : "Could not save interests.");
    } finally {
      setSavingInterestId(null);
    }
  }

  // Toggle a single preference
  async function handleSettingChange(key: keyof UserSettings, value: boolean) {
    const previous = settings[key];
    setSettings((s) => ({ ...s, [key]: value }));
    setSavingSetting(key);
    try {
      await updateSettings({ [key]: value });
    } catch (caught) {
      setSettings((s) => ({ ...s, [key]: previous }));
      setError(caught instanceof Error ? caught.message : "Could not save preference.");
    } finally {
      setSavingSetting(null);
    }
  }

  useEffect(() => {
    void loadProfileData();
  }, []);

  // Helper to extract initials for the avatar component
  const getInitials = (name?: string) => {
    if (!name) return "LU";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Preference row component
  const PreferenceRow = ({
    icon,
    label,
    description,
    checked,
    saving,
    onChange,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    saving: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div
      className="flex items-center justify-between gap-4 p-3.5 rounded-xl transition-colors"
      style={{
        background: checked
          ? "color-mix(in srgb, var(--color-coral) 6%, transparent)"
          : "color-mix(in srgb, var(--color-ink) 2%, transparent)",
        border: "1px solid",
        borderColor: checked ? "color-mix(in srgb, var(--color-coral) 30%, transparent)" : "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="shrink-0 flex items-center justify-center rounded-lg"
          style={{
            width: "36px",
            height: "36px",
            background: checked ? "var(--color-coral)" : "color-mix(in srgb, var(--color-ink) 10%, transparent)",
            color: checked ? "#fff" : "var(--color-muted)",
            transition: "background 0.2s ease, color 0.2s ease",
          }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--color-ink)" }}>{label}</p>
          <p className="text-xs truncate" style={{ color: "var(--color-muted)" }}>{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={saving}
        onClick={() => onChange(!checked)}
        className="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60"
        style={{
          width: "44px",
          height: "26px",
          background: checked ? "var(--color-coral)" : "color-mix(in srgb, var(--color-ink) 18%, transparent)",
          boxShadow: checked ? "0 0 0 3px color-mix(in srgb, var(--color-coral) 18%, transparent)" : "none",
        }}
      >
        <span
          className="inline-flex items-center justify-center rounded-full bg-white shadow transition-transform duration-200"
          style={{
            width: "20px",
            height: "20px",
            transform: checked ? "translateX(21px)" : "translateX(3px)",
          }}
        >
          {saving && (
            <span
              className="block rounded-full animate-spin"
              style={{
                width: "10px",
                height: "10px",
                border: "2px solid color-mix(in srgb, var(--color-coral) 40%, transparent)",
                borderTopColor: "var(--color-coral)",
              }}
            />
          )}
        </span>
      </button>
    </div>
  );

  return (
    <SiteShell>
      <div className="prototype-shell p-4 sm:p-6 min-h-screen">
        {/* Page Header Area */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--color-ink)" }}>Profile Workspace</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Manage your personal bio, check your unlocked badges, and review active groups.
            </p>
          </div>

          {/* Navigation Link to the Edit Profile Page */}
          <Link
            href="/profile/edit"
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 self-start sm:self-center text-center no-underline inline-block w-full sm:w-auto"
            style={{ background: "var(--color-coral)" }}
          >
            Edit Profile
          </Link>
        </div>

        {/* Error feedback if API request fails */}
        {error && (
          <div className="max-w-6xl mx-auto mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--color-muted)" }}>
            Loading your custom profile workspace...
          </div>
        ) : (
          /* Grid Layout: Main workspace view split into two dynamic columns */
          <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 lg:grid-cols-[1fr_380px]">

            {/* LEFT COLUMN: Contains Biography, Interests, Active Groups, and Personal Settings */}
            <div className="flex flex-col gap-6 min-w-0">

              {/* Bio & Identity Panel */}
              <div className="sidebar-panel p-4 sm:p-6 rounded-xl flex flex-col gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                  <User size={18} style={{ color: "var(--color-coral)" }} />
                  Bio & Identity
                </h2>

                <div className="grid gap-4">
                  <div className="p-4 rounded-lg flex flex-col gap-2" style={{ background: "color-mix(in srgb, var(--color-ink) 3%, transparent)", border: "1px solid var(--color-border)" }}>
                    <span className="text-xs uppercase font-semibold" style={{ color: "var(--color-muted)" }}>About Me</span>
                    <p className="text-sm italic leading-relaxed break-words" style={{ color: "var(--color-ink)" }}>
                      {profile?.bio || "No biography added yet. Click 'Edit Profile' to update your description!"}
                    </p>
                  </div>

                  {/* Meta details from the database */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm" style={{ color: "var(--color-ink)" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={16} className="shrink-0" style={{ color: "var(--color-coral)" }} />
                      <span className="truncate"><strong>Location:</strong> {profile?.city || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={16} className="shrink-0" style={{ color: "var(--color-coral)" }} />
                      <span className="truncate"><strong>Email:</strong> {user?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar size={16} className="shrink-0" style={{ color: "var(--color-coral)" }} />
                      <span className="truncate"><strong>Registered:</strong> {user?.createdAt ? new Date(user.createdAt).getFullYear() : "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Interests Panel */}
              <div className="sidebar-panel p-4 sm:p-6 rounded-xl flex flex-col gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                  <Award size={18} style={{ color: "var(--color-coral)" }} />
                  Interests
                </h2>
                <div className="category-pill-row flex flex-wrap gap-2">
                  {availableInterests.length === 0 && (
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                      No interests available yet.
                    </p>
                  )}
                  {availableInterests.map((interest) => {
                    const active = myInterestIds.includes(interest.id);
                    const saving = savingInterestId === interest.id;
                    return (
                      <button
                        type="button"
                        key={interest.id}
                        onClick={() => handleInterestToggle(interest.id)}
                        disabled={saving}
                        className={`category-pill inline-flex items-center transition-opacity disabled:opacity-60 ${active ? "active" : ""}`}
                        style={{ border: "none", cursor: "pointer", font: "inherit" }}
                      >
                        {interest.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Tap an interest to add or remove it from your profile.
                </p>
              </div>

              {/* Active Connected Groups Panel */}
              <div className="sidebar-panel p-4 sm:p-6 rounded-xl flex flex-col gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                  <Users size={18} style={{ color: "var(--color-coral)" }} />
                  My Active Groups
                </h2>

                <div className="group-list flex flex-col gap-3">
                  {groups.length === 0 && (
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                      You haven&apos;t joined any groups yet.
                    </p>
                  )}
                  {groups.map((group) => (
                    <div className="group-row flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg" style={{ border: "1px solid var(--color-border)" }} key={group.id}>
                      <div className="avatar-stack flex -space-x-2 shrink-0">
                        {Array.from({ length: Math.min(group.memberCount, 3) }).map((_, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-full border-2"
                            style={{ background: `color-mix(in srgb, var(--color-ink) ${15 + i * 10}%, transparent)`, borderColor: "var(--color-bg, #fff)" }}
                          />
                        ))}
                        {group.memberCount > 3 && (
                          <span
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                            style={{ background: "var(--color-coral)", color: "#fff", borderColor: "var(--color-bg, #fff)" }}
                          >
                            +{group.memberCount - 3}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong style={{ color: "var(--color-ink)" }}>{group.title}</strong>
                        <p className="text-sm" style={{ color: "var(--color-muted)" }}>{group.groupNote}</p>
                      </div>
                      <em className="shrink-0" style={{ color: "var(--color-coral)", fontStyle: "normal", fontWeight: 800 }}>{group.maxMembers}</em>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification and Context Settings Panel */}
              <div className="sidebar-panel p-4 sm:p-6 rounded-xl flex flex-col gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                  <Settings size={18} style={{ color: "var(--color-coral)" }} />
                  Preferences & Settings
                </h2>
                <div className="flex flex-col gap-3">
                  <PreferenceRow
                    icon={<Bell size={18} />}
                    label="Email notifications"
                    description="Get notified when someone matches your interests"
                    checked={settings.emailNotifications}
                    saving={savingSetting === "emailNotifications"}
                    onChange={(v) => handleSettingChange("emailNotifications", v)}
                  />
                  <PreferenceRow
                    icon={<Eye size={18} />}
                    label="Public profile"
                    description="Make your profile details visible to city users"
                    checked={settings.publicProfile}
                    saving={savingSetting === "publicProfile"}
                    onChange={(v) => handleSettingChange("publicProfile", v)}
                  />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Visual Profile Card and Badge System Links */}
            <div className="flex flex-col gap-6 min-w-0">

              {/* Visual Identity Profile Card - Kliklədikdə Profil Redaktə səhifəsinə aparır */}
              <Link href="/profile/edit" className="no-underline block group">
                <div className="profile-panel p-4 sm:p-6 rounded-xl cursor-pointer transition-transform duration-150 ease-out group-hover:scale-[1.02] active:scale-105">
                  <div className="profile-card-top flex items-center gap-3">
                    <div className="profile-avatar shrink-0 flex items-center justify-center text-white font-black text-xl">
                      {getInitials(user?.name || profile?.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold truncate" style={{ color: "var(--color-ink)" }}>{user?.name || profile?.name || "Loopin User"}</p>
                      <span className="truncate block" style={{ color: "var(--color-muted)", fontSize: "0.84rem" }}>{profile?.city || "Baku, Azerbaijan"}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-4 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
                    <p className="leading-relaxed">Active Status: {user?.isActive === false ? "Inactive" : "Connected"}</p>
                  </div>
                </div>
              </Link>

              {/* Unlocked Badges Workspace Module - Bütün keçidlər bu blokun daxilindədir */}
              <div id="badges" className="sidebar-panel p-4 sm:p-6 rounded-xl flex flex-col gap-4 scroll-mt-24">
                <div className="flex items-center justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
                  <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                    <Award size={18} style={{ color: "var(--color-coral)" }} />
                    Nişanlar Sistemi
                  </h2>
                  
                  {/* Hər iki fərqli nişan səhifəsinin keçidi bura yığıldı */}
                  <div className="flex gap-2.5 text-xs font-semibold shrink-0">
                    <Link
                      href="/profile/my-badges"
                      className="hover:underline transition-all"
                      style={{ color: "var(--color-coral)" }}
                    >
                      mine
                    </Link>
                    <span style={{ color: "var(--color-border)" }}>|</span>
                    <Link
                      href="/profile/badges"
                      className="hover:underline transition-all"
                      style={{ color: "var(--color-muted)" }}
                    >
                      view all →
                    </Link>
                  </div>
                </div>

                {/* Badges list dynamic grid */}
                <div className="badge-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  {/* Badge 1 */}
                  <div className="flex items-center gap-3 p-2 rounded-lg transition-opacity" style={{ background: "color-mix(in srgb, var(--color-ink) 2%, transparent)", opacity: badges.includes("ATTENDEE") ? 1 : 0.35 }}>
                    <CheckCircle2 size={20} style={{ color: "var(--color-coral)" }} />
                    <span style={{ color: "var(--color-ink)", fontWeight: 600, fontSize: "0.9rem" }}>Attendee</span>
                  </div>
                  {/* Badge 2 */}
                  <div className="flex items-center gap-3 p-2 rounded-lg transition-opacity" style={{ background: "color-mix(in srgb, var(--color-ink) 2%, transparent)", opacity: badges.includes("CREATOR") ? 1 : 0.35 }}>
                    <Sparkles size={20} style={{ color: "var(--color-coral)" }} />
                    <span style={{ color: "var(--color-ink)", fontWeight: 600, fontSize: "0.9rem" }}>Creator</span>
                  </div>
                  {/* Badge 3 */}
                  <div className="flex items-center gap-3 p-2 rounded-lg transition-opacity" style={{ background: "color-mix(in srgb, var(--color-ink) 2%, transparent)", opacity: badges.includes("HELPER") ? 1 : 0.35 }}>
                    <Flag size={20} style={{ color: "var(--color-coral)" }} />
                    <span style={{ color: "var(--color-ink)", fontWeight: 600, fontSize: "0.9rem" }}>Helper</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </SiteShell>
  );
}