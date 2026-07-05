"use client";

import { useEffect, useState } from "react";
import { getBadges } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, PageHeader, Panel, SiteShell } from "../../../site";

export default function ProfileBadgesPage() {
  const [badges, setBadges] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setBadges(await getBadges());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load badges.");
      }
    }
    void load();
  }, []);

  return (
    <SiteShell>
      <PageHeader title="Badges" subtitle="Badges connected to your Loopin account." />
      <ErrorMessage message={error} />
      <Panel>
        {badges.length ? (
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <span className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        ) : <EmptyState>No badges yet.</EmptyState>}
      </Panel>
    </SiteShell>
  );
}
