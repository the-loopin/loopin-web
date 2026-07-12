"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBadges, getCurrentUser, getProfile, ProfilePayload, UserItem } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, PageHeader, SiteShell } from "../../site";
import { CheckCircle2, Sparkles, Flag, MapPin, Mail, Shield, User, Settings as SettingsIcon, Users, Calendar, Award } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<UserItem | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Simple local settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    publicProfile: true,
    activityMatching: true
  });

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const [nextUser, nextProfile, nextBadges] = await Promise.all([
        getCurrentUser(),
        getProfile(),
        getBadges(),
      ]);
      setUser(nextUser);
      setProfile(nextProfile);
      setBadges(nextBadges);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Mock groups for the Groups section
  const mockMyGroups = [
    { id: 1, title: "Focus builders", size: "3 / 4", note: "Working on loopin frontend" },
    { id: 2, title: "Photo walkers", size: "5 / 6", note: "Meeting at Old City gate" }
  ];

  return (
    <SiteShell>
      <PageHeader 
        title="Profile Workspace" 
        subtitle="Manage your personal bio, settings, check your unlocked badges, and review active groups." 
        action={
          <Link className="primary-link" href="/profile/edit">
            Edit Profile
          </Link>
        } 
      />
      <ErrorMessage message={error} />

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading your profile workspace...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Details, Groups, and Settings */}
          <div className="flex flex-col gap-6">
            
            {/* Main Bio / Details panel */}
            <div className="sidebar-panel p-6 rounded-xl flex flex-col gap-4">
              <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
                <User size={18} className="text-[var(--color-coral)]" />
                Bio & Identity
              </h2>
              {user ? (
                <div className="grid gap-4">
                  <div className="p-4 bg-[color-mix(in_srgb,var(--color-ink)_3%,transparent)] border border-[var(--line)] rounded-lg flex flex-col gap-2">
                    <span className="text-xs text-[var(--muted)] uppercase font-semibold">Self-description</span>
                    <p className="text-sm text-[var(--color-ink)] italic">
                      {profile?.bio || "No biography added yet. Update your profile to add your interests and description!"}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      <MapPin size={16} className="text-[var(--color-coral)]" />
                      <span><strong>City:</strong> {profile?.city || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      <Mail size={16} className="text-[var(--color-coral)]" />
                      <span><strong>Email:</strong> {user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      <Shield size={16} className="text-[var(--color-coral)]" />
                      <span><strong>Role:</strong> {user.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      <Calendar size={16} className="text-[var(--color-coral)]" />
                      <span><strong>Member since:</strong> 2026</span>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState>No profile loaded.</EmptyState>
              )}
            </div>

            {/* Groups section */}
            <div id="groups" className="sidebar-panel p-6 rounded-xl flex flex-col gap-4 scroll-mt-24">
              <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
                <Users size={18} className="text-[var(--color-coral)]" />
                My Active Groups
              </h2>
              <div className="group-list">
                {mockMyGroups.map((group) => (
                  <div className="group-row" key={group.id}>
                    <div className="avatar-stack">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div>
                      <strong>{group.title}</strong>
                      <p>{group.note}</p>
                    </div>
                    <em className="text-coral font-extrabold not-italic">{group.size}</em>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings section */}
            <div id="settings" className="sidebar-panel p-6 rounded-xl flex flex-col gap-4 scroll-mt-24">
              <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
                <SettingsIcon size={18} className="text-[var(--color-coral)]" />
                Preference Settings
              </h2>
              <div className="flex flex-col gap-3 text-sm text-[var(--color-ink)]">
                <label className="flex items-center justify-between p-3 bg-[color-mix(in_srgb,var(--color-ink)_3%,transparent)] border border-[var(--line)] rounded-lg">
                  <span>Receive email notifications for matched interests</span>
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications} 
                    onChange={(e) => setSettings(s => ({ ...s, emailNotifications: e.target.checked }))}
                    className="accent-accent"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[color-mix(in_srgb,var(--color-ink)_3%,transparent)] border border-[var(--line)] rounded-lg">
                  <span>Make my profile details public to city users</span>
                  <input 
                    type="checkbox" 
                    checked={settings.publicProfile} 
                    onChange={(e) => setSettings(s => ({ ...s, publicProfile: e.target.checked }))}
                    className="accent-accent"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[color-mix(in_srgb,var(--color-ink)_3%,transparent)] border border-[var(--line)] rounded-lg">
                  <span>Enable auto-matching for suggested activities</span>
                  <input 
                    type="checkbox" 
                    checked={settings.activityMatching} 
                    onChange={(e) => setSettings(s => ({ ...s, activityMatching: e.target.checked }))}
                    className="accent-accent"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Profile Card and Badges */}
          <div className="flex flex-col gap-6">
            
            {/* Visual Profile Panel - reference layout */}
            <div className="profile-panel rounded-xl">
              <div className="profile-card-top mb-4">
                <div className="profile-avatar">
                  {getInitials(user?.name || profile?.name)}
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--color-ink)]">{user?.name || profile?.name || "Loopin User"}</p>
                  <span>{profile?.city || "Baku, Azerbaijan"}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--muted)] border-t border-[var(--line)] pt-3 leading-relaxed">
                Interests: Tech, social gatherings, creative walks, startup networks.
              </p>
            </div>

            {/* Badges Panel */}
            <div id="badges" className="sidebar-panel p-6 rounded-xl flex flex-col gap-4 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
                  <Award size={18} className="text-[var(--color-coral)]" />
                  Unlocked Badges
                </h2>
                <Link href="/profile/my-badges" className="primary-link text-sm font-semibold">
                  My Badges →
                </Link>
              </div>
              <div className="badge-grid">
                {/* Dynamically check if backend has specific badges, else show visual prototype mock badges */}
                <div style={{ opacity: badges.includes("ATTENDEE") || badges.length > 0 ? 1 : 0.4 }}>
                  <CheckCircle2 size={20} className="text-coral" />
                  <span>Attendee</span>
                </div>
                <div style={{ opacity: badges.includes("CREATOR") || badges.length > 0 ? 1 : 0.4 }}>
                  <Sparkles size={20} className="text-coral" />
                  <span>Creator</span>
                </div>
                <div style={{ opacity: badges.includes("HELPER") || badges.length > 0 ? 1 : 0.4 }}>
                  <Flag size={20} className="text-coral" />
                  <span>Helper</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </SiteShell>
  );
}

