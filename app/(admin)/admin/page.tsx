"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminStats, DashboardStatsResponse } from "@/lib/api";
import { SiteShell, PageHeader, Panel } from "../../site";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data || {});
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        setError("Could not load real-time statistics.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // API-dan gələn key-lərə uyğun olaraq dizaynı idarə edirik
  // Gözlənilən key-lər: örnək olaraq "users", "events", "groups" və ya backend-dən nə qayıdırsa
  const dashboardStats = [
    {
      title: "Total Users",
      value: stats.totalUsers ?? 0,
      icon: "👥",
      gradient: "from-blue-500/10 to-indigo-500/5",
      textColor: "text-blue-500",
      borderColor: "hover:border-blue-500/30",
    },
    {
      title: "Total Events",
      value: stats.activeEvents ?? 0,
      icon: "🎟️",
      gradient: "from-amber-500/10 to-orange-500/5",
      textColor: "text-amber-500",
      borderColor: "hover:border-amber-500/30",
    },
    {
      title: "Total Groups",
      value: stats.totalGroups ?? 0,
      icon: "👥",
      gradient: "from-emerald-500/10 to-teal-500/5",
      textColor: "text-emerald-500",
      borderColor: "hover:border-emerald-500/30",
    },
  ];

  const quickNavigations = [
    {
      title: "User Management",
      desc: "View, filter roles, and moderate registered members.",
      href: "/admin/users",
      icon: "👤",
      bgClass: "hover:bg-blue-500/5",
    },
    {
      title: "Event Hub",
      desc: "Create, inspect, and archive active platform events.",
      href: "/admin/events",
      icon: "📅",
      bgClass: "hover:bg-amber-500/5",
    },
    {
      title: "Group Hub",
      desc: "Lookup and manage member groups and join requests.",
      href: "/admin/groups",
      icon: "🔗",
      bgClass: "hover:bg-emerald-500/5",
    },
  ];

  return (
    <SiteShell>
      {/* Səhifə Başlığı */}
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Welcome back! Here is a real-time overview of the Loopin platform ecosystem." 
      />

      <div className="space-y-8 mt-4">
        
        {/* STATİSTİKA BÖLMƏSİ */}
        <div className="grid gap-4 sm:grid-cols-3">
          {dashboardStats.map((stat, idx) => (
            <div 
              key={idx} 
              className={`relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--color-surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-gradient-to-br ${stat.gradient} ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[var(--color-muted)]">
                  {stat.title}
                </span>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-4xl font-black tracking-tight ${stat.textColor}`}>
                  {loading ? (
                    <span className="text-2xl font-medium animate-pulse text-[var(--muted)]">...</span>
                  ) : error ? (
                    <span className="text-sm font-semibold text-red-500">Error</span>
                  ) : (
                    stat.value
                  )}
                </span>
                <span className="text-xs text-[var(--muted)] font-medium">active items</span>
              </div>
              {/* Dekorativ alt xətt animasiyası */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-[var(--line)] opacity-10"></div>
            </div>
          ))}
        </div>

        {/* İDARƏETMƏ SAHƏLƏRİNƏ KECİDLƏR (Quick Navigation Cards) */}
        <div>
          <h2 className="text-xs uppercase font-black tracking-widest text-[var(--color-muted)] mb-4">
            Platform Management Sectors
          </h2>
          
          <Panel>
            <div className="grid gap-4 md:grid-cols-3">
              {quickNavigations.map((nav, idx) => (
                <Link 
                  href={nav.href} 
                  key={idx}
                  className={`group flex flex-col justify-between p-5 rounded-lg border border-[var(--line)] bg-[var(--color-background)] transition-all duration-200 ${nav.bgClass} hover:border-[var(--color-accent-light)]`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-md bg-[var(--color-surface)] border border-[var(--line)] flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                        {nav.icon}
                      </div>
                      <span className="text-xs text-[var(--color-accent)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Manage <span>→</span>
                      </span>
                    </div>
                    
                    <h3 className="mt-4 font-bold text-base text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                      {nav.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                      {nav.desc}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-[var(--line)] border-dashed text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)] group-hover:text-[var(--color-ink)] transition-colors">
                    Access Console
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

      </div>
    </SiteShell>
  );
}