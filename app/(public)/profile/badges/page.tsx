"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getBadges } from "@/lib/api/loopin";
import { ArrowLeft, Award, CheckCircle2, Sparkles, Flag, Lock, HelpCircle } from "lucide-react";
import { SiteShell } from "../../../site"; // Layihənizdəki import yoluna uyğun tənzimləyin

// Platformadakı bütün mümkün nişanların siyahısı və izahları
const ALL_AVAILABLE_BADGES = [
  {
    id: "ATTENDEE",
    title: "Attendee",
    description: "Successfully joined and participated in your first community event.",
    icon: CheckCircle2,
  },
  {
    id: "CREATOR",
    title: "Creator",
    description: "Created a group or organized a community walk/event under your name.",
    icon: Sparkles,
  },
  {
    id: "HELPER",
    title: "Helper",
    description: "Recognized by other members for guiding and supporting the community.",
    icon: Flag,
  },
];

export default function BadgesPage() {
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBadges() {
      setLoading(true);
      setError("");
      try {
        const response = await getBadges();
        setUnlockedBadges(response);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load badges.");
      } finally {
        setLoading(false);
      }
    }
    void fetchBadges();
  }, []);

  return (
    <SiteShell>
      <div className="prototype-shell p-6 min-h-screen">
        
        {/* Səhifə Başlığı və Geri Naviqasiya */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--color-border)" }}>
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
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-ink)" }}>Community Badges</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Track your unlocked achievements and learn how to collect other community titles.
            </p>
          </div>
        </div>

        {/* API Xətası */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--color-muted)" }}>
            Loading the Loopin achievement vault...
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            
            {/* Nişanların Statistika Paneli */}
            <div className="sidebar-panel p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ background: "color-mix(in srgb, var(--color-coral) 10%, transparent)" }}>
                  <Award size={24} style={{ color: "var(--color-coral)" }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "var(--color-ink)" }}>Your Progress</h3>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>Keep participating in events to unlock more recognition.</p>
                </div>
              </div>
              <div className="text-2xl font-black sm:text-right" style={{ color: "var(--color-ink)" }}>
                {unlockedBadges.length} <span className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>/ {ALL_AVAILABLE_BADGES.length} Unlocked</span>
              </div>
            </div>

            {/* Əsas Detallı Siyahı Grid-i */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {ALL_AVAILABLE_BADGES.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                const BadgeIcon = badge.icon;

                return (
                  <div 
                    key={badge.id} 
                    className="sidebar-panel p-5 rounded-xl flex flex-col justify-between gap-4 transition-all"
                    style={{ 
                      opacity: isUnlocked ? 1 : 0.45,
                      border: isUnlocked ? "2px solid var(--color-coral)" : "1px solid var(--color-border)"
                    }}
                  >
                    <div>
                      {/* Üst İkon və Kilid Statusu */}
                      <div className="flex items-center justify-between mb-3">
                        <div 
                          className="p-2.5 rounded-lg inline-block" 
                          style={{ 
                            background: isUnlocked 
                              ? "color-mix(in srgb, var(--color-coral) 12%, transparent)" 
                              : "color-mix(in srgb, var(--color-ink) 5%, transparent)" 
                          }}
                        >
                          <BadgeIcon size={22} style={{ color: isUnlocked ? "var(--color-coral)" : "var(--color-muted)" }} />
                        </div>
                        
                        {!isUnlocked && (
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                            <Lock size={10} /> Locked
                          </div>
                        )}
                      </div>

                      {/* Başlıq və İzah */}
                      <h3 className="font-bold text-base mb-1" style={{ color: "var(--color-ink)" }}>{badge.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                        {badge.description}
                      </p>
                    </div>

                    {/* Aşağı Status Çubuğu */}
                    <div className="border-t pt-3 mt-2 text-[11px] font-semibold flex items-center justify-between">
                      <span style={{ color: isUnlocked ? "var(--color-coral)" : "var(--color-muted)" }}>
                        {isUnlocked ? "✨ Status: Active" : "🔒 Requirement Not Met"}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Necə qazanmaq olar bölməsi (Faydalı məlumat qutusu) */}
            <div className="sidebar-panel p-5 rounded-xl flex items-start gap-3" style={{ background: "color-mix(in srgb, var(--color-ink) 2%, transparent)" }}>
              <HelpCircle size={18} className="mt-0.5" style={{ color: "var(--color-coral)" }} />
              <div className="text-xs flex flex-col gap-1">
                <span className="font-bold" style={{ color: "var(--color-ink)" }}>How to request missing badges?</span>
                <p style={{ color: "var(--color-muted)" }}>
                  If you have attended or hosted an event but your badge is still locked, please reach out to the Loopin channel core organizers with your register ID to refresh your status.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </SiteShell>
  );
}