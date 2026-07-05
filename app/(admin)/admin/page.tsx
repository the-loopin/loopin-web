"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api/loopin";
import { ErrorMessage, PageHeader, Panel, SiteShell } from "../../site";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setStats(await getAdminStats());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load dashboard.");
      }
    }
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <SiteShell>
      <PageHeader title="Admin dashboard" subtitle="Manage Loopin users and events." />
      <ErrorMessage message={error} />
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(stats).length ? Object.entries(stats).map(([key, value]) => (
          <Panel key={key}>
            <p className="text-sm uppercase text-slate-500">{key}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </Panel>
        )) : <Panel><p className="text-sm text-slate-400">No stats loaded.</p></Panel>}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className="primary-link" href="/admin/users">Manage users</Link>
        <Link className="secondary-link" href="/admin/events">Manage events</Link>
      </div>
    </SiteShell>
  );
}
