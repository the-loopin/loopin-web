"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBadges, getCurrentUser, getProfile, ProfilePayload, UserItem } from "@/lib/api/loopin";
import { User, MapPin, Mail, Calendar, Shield, Award, Users, CheckCircle2, Sparkles, Flag, Settings } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  
  // States for live database data
  const [user, setUser] = useState<UserItem | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Preference settings local state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    publicProfile: true,
  });

  // Active Groups mock data (Connect to your Group API when available)
  const mockGroups = [
    { id: 1, title: "Focus Builders", size: "3 / 4", note: "Working on the frontend architecture of the Loopin platform." },
    { id: 2, title: "Photo Walkers", size: "5 / 6", note: "Creative photo-walk group meeting at the Old City gates." }
  ];

  // Fetch real data from database on mount
  async function loadProfileData() {
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
      setError(caught instanceof Error ? caught.message : "Could not load profile data.");
    } finally {
      setLoading(false);
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

  return (
    <div className="prototype-shell p-6 min-h-screen">
      {/* Page Header Area */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--color-border)" }}>
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-ink)" }}>Profile Workspace</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Manage your personal bio, check your unlocked badges, and review active groups.
          </p>
        </div>
        
        {/* Navigation Link to the Edit Profile Page */}
        <Link 
          href="/profile/edit"
          className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 self-start sm:self-center text-center no-underline inline-block" 
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
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1fr_380px]">
          
          {/* LEFT COLUMN: Contains Biography, Interests, Active Groups, and Personal Settings */}
          <div className="flex flex-col gap-6">
            
            {/* Bio & Identity Panel */}
            <div className="sidebar-panel p-6 rounded-xl flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                <User size={18} style={{ color: "var(--color-coral)" }} />
                Bio & Identity
              </h2>
              
              <div className="grid gap-4">
                <div className="p-4 rounded-lg flex flex-col gap-2" style={{ background: "color-mix(in srgb, var(--color-ink) 3%, transparent)", border: "1px solid var(--color-border)" }}>
                  <span className="text-xs uppercase font-semibold" style={{ color: "var(--color-muted)" }}>About Me</span>
                  <p className="text-sm italic leading-relaxed" style={{ color: "var(--color-ink)" }}>
                    {profile?.bio || "No biography added yet. Click 'Edit Profile' to update your description!"}
                  </p>
                </div>
                
                {/* Meta details fueled by database responses */}
                <div className="grid sm:grid-cols-2 gap-4 text-sm" style={{ color: "var(--color-ink)" }}>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} style={{ color: "var(--color-coral)" }} />
                    <span><strong>Location:</strong> {profile?.city || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} style={{ color: "var(--color-coral)" }} />
                    <span><strong>Email:</strong> {user?.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={16} style={{ color: "var(--color-coral)" }} />
                    <span><strong>Role:</strong> {user?.role || "Member"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} style={{ color: "var(--color-coral)" }} />
                    <span><strong>Registered:</strong> 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Interests Panel */}
            <div className="sidebar-panel p-6 rounded-xl flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                <Award size={18} style={{ color: "var(--color-coral)" }} />
                Interests
              </h2>
              <div className="category-pill-row">
                <span className="category-pill inline-flex items-center active">Tech</span>
                <span className="category-pill inline-flex items-center">Design</span>
                <span className="category-pill inline-flex items-center">Startups</span>
                <span className="category-pill inline-flex items-center">Creative Walks</span>
              </div>
            </div>

            {/* Active Connected Groups Panel */}
            <div className="sidebar-panel p-6 rounded-xl flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                <Users size={18} style={{ color: "var(--color-coral)" }} />
                My Active Groups
              </h2>
              
              <div className="group-list">
                {mockGroups.map((group) => (
                  <div className="group-row" key={group.id}>
                    <div className="avatar-stack">
                      <span style={{ background: "color-mix(in srgb, var(--color-ink) 15%, transparent)" }} />
                      <span style={{ background: "color-mix(in srgb, var(--color-ink) 25%, transparent)" }} />
                      <span style={{ background: "color-mix(in srgb, var(--color-ink) 35%, transparent)" }} />
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-ink)" }}>{group.title}</strong>
                      <p style={{ color: "var(--color-muted)" }}>{group.note}</p>
                    </div>
                    <em style={{ color: "var(--color-coral)", fontStyle: "normal", fontWeight: 800 }}>{group.size}</em>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification and Context Settings Panel */}
            <div className="sidebar-panel p-6 rounded-xl flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
                <Settings size={18} style={{ color: "var(--color-coral)" }} />
                Preferences & Settings
              </h2>
              <div className="flex flex-col gap-3 text-sm" style={{ color: "var(--color-ink)" }}>
                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors" style={{ background: "color-mix(in srgb, var(--color-ink) 2%, transparent)", border: "1px solid var(--color-border)" }}>
                  <span>Receive email notifications for matched interests</span>
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications} 
                    onChange={(e) => setSettings(s => ({ ...s, emailNotifications: e.target.checked }))}
                    style={{ accentColor: "var(--color-coral)", width: "16px", height: "16px" }}
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors" style={{ background: "color-mix(in srgb, var(--color-ink) 2%, transparent)", border: "1px solid var(--color-border)" }}>
                  <span>Make my profile details public to city users</span>
                  <input 
                    type="checkbox" 
                    checked={settings.publicProfile} 
                    onChange={(e) => setSettings(s => ({ ...s, publicProfile: e.target.checked }))}
                    style={{ accentColor: "var(--color-coral)", width: "16px", height: "16px" }}
                  />
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Visual Profile Card and Badge System Links */}
          <div className="flex flex-col gap-6">
            
            {/* Visual Identity Profile Card */}
            <div className="profile-panel p-6 rounded-xl">
              <div className="profile-card-top">
                <div className="profile-avatar flex items-center justify-center text-white font-black text-xl">
                  {getInitials(user?.name || profile?.name)}
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: "var(--color-ink)" }}>{user?.name || profile?.name || "Loopin User"}</p>
                  <span style={{ color: "var(--color-muted)", fontSize: "0.84rem" }}>{profile?.city || "Baku, Azerbaijan"}</span>
                </div>
              </div>
              
              <div className="border-t pt-3 mt-4 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
                <p className="leading-relaxed">Active Status: Connected</p>
              </div>
            </div>

            {/* Unlocked Badges Workspace Module with redirection hook */}
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
  );
}