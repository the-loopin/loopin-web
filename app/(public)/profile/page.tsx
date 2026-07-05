"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBadges, getCurrentUser, getProfile, ProfilePayload, UserItem } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, PageHeader, Panel, SiteShell } from "../../site";

export default function ProfilePage() {
  const [user, setUser] = useState<UserItem | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [error, setError] = useState("");

  async function loadProfile() {
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
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <SiteShell>
      <PageHeader title="Profile" subtitle="Your account, profile details and earned badges." action={<Link className="primary-link" href="/profile/edit">Edit profile</Link>} />
      <ErrorMessage message={error} />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Panel title="Account">
          {user ? (
            <dl className="grid gap-3 text-sm">
              <div><dt className="text-slate-500">Name</dt><dd className="text-white">{user.name ?? profile?.name ?? "-"}</dd></div>
              <div><dt className="text-slate-500">Email</dt><dd className="text-white">{user.email}</dd></div>
              <div><dt className="text-slate-500">Role</dt><dd className="text-white">{user.role}</dd></div>
              <div><dt className="text-slate-500">City</dt><dd className="text-white">{profile?.city ?? "-"}</dd></div>
              <div><dt className="text-slate-500">Bio</dt><dd className="text-white">{profile?.bio ?? "-"}</dd></div>
            </dl>
          ) : <EmptyState>No profile loaded.</EmptyState>}
        </Panel>
        <Panel title="Badges">
          {badges.length ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => <span className="rounded-full bg-cyan-400 px-3 py-1 text-sm font-semibold text-slate-950" key={badge}>{badge}</span>)}
            </div>
          ) : <EmptyState>No badges yet.</EmptyState>}
        </Panel>
      </div>
    </SiteShell>
  );
}
