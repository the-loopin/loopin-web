"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBadges } from "@/lib/api";
import { ArrowLeft, Award, CheckCircle2, Sparkles, Flag, Lock, HelpCircle } from "lucide-react";
import { SiteShell } from "../../../site";

// Global blueprint for all system badges mapping
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
  const pathname = usePathname();
  
  // Dynamic switch rule based on the current URL path location
  const isMineOnlyMode = pathname.includes("/my-badges");

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBadges() {
      setLoading(true);
      setError("");
      try {
        const response = await getBadges();
        // Fallback safety layer in case response is missing an array context
        setUnlockedBadges(Array.isArray(response) ? response : []);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load badges.");
      } finally {
        setLoading(false);
      }
    }
    void fetchBadges();
  }, []);

  // Filter computation logic handled reactively on state updates
  const displayedBadges = isMineOnlyMode
    ? ALL_AVAILABLE_BADGES.filter((b) => unlockedBadges.includes(b.id))
    : ALL_AVAILABLE_BADGES;

  return (
    <SiteShell>
      <div className="prototype-shell p-4 sm:p-6 min-h-screen">
        
        {/* Navigation Header Structure */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8 flex flex-col gap-4 border-b pb-6" style={{ borderColor: "var(--color-border)" }}>
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
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--color-ink)" }}>
              {isMineOnlyMode ? "My Earned Badges" : "Community Badges"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              {isMineOnlyMode 
                ? "Review your personal active achievements and community credentials."
                : "Track your unlocked achievements and learn how to collect other community titles."
              }
            </p>
          </div>

          {/* Dynamic Tab Toggle Row */}
          <div className="flex border-b text-sm mt-2" style={{ borderColor: "var(--color-border)" }}>
            <Link 
              href="/profile/badges"
              className="px-4 py-2 font-bold no-underline transition-all border-b-2"
              style={{ 
                color: !isMineOnlyMode ? "var(--color-coral)" : "var(--color-muted)",
                borderColor: !isMineOnlyMode ? "var(--color-coral)" : "transparent"
              }}
            >
              All Badges ({ALL_AVAILABLE_BADGES.length})
            </Link>
            <Link 
              href="/profile/my-badges"
              className="px-4 py-2 font-bold no-underline transition-all border-b-2"
              style={{ 
                color: isMineOnlyMode ? "var(--color-coral)" : "var(--color-muted)",
                borderColor: isMineOnlyMode ? "var(--color-coral)" : "transparent"
              }}
            >
              My Badges ({unlockedBadges.length})
            </Link>
          </div>
        </div>

        {/* Dynamic Error Messaging Output */}
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
            
            {/* Real-time Progress Breakdown Module */}
            <div className="sidebar-panel p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ background: "color-mix(in srgb, var(--color-coral) 10%, transparent)" }}>
                  <Award size={24} style={{ color: "var(--color-coral)" }} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg" style={{ color: "var(--color-ink)" }}>Your Progress</h3>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>Keep participating in events to unlock more recognition.</p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black sm:text-right" style={{ color: "var(--color-ink)" }}>
                {unlockedBadges.length} <span className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>/ {ALL_AVAILABLE_BADGES.length} Unlocked</span>
              </div>
            </div>

            {/* Empty State Handlers for Personal Vault View */}
            {displayedBadges.length === 0 && isMineOnlyMode ? (
              <div className="text-center py-12 border border-dashed rounded-xl p-8" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                  You haven&apos;t unlocked any badges yet. Check out the{" "}
                  <Link href="/profile/badges" className="font-bold underline" style={{ color: "var(--color-coral)" }}>
                    All Badges
                  </Link>{" "}
                  tab to find out how to earn them!
                </p>
              </div>
            ) : (
              /* Core Grid Listing UI */
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {displayedBadges.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  const BadgeIcon = badge.icon;

                  return (
                    <div 
                      key={badge.id} 
                      className="sidebar-panel p-5 rounded-xl flex flex-col justify-between gap-4 transition-all"
                      style={{ 
                        opacity: isUnlocked ? 1 : 0.5,
                        border: isUnlocked ? "2px solid var(--color-coral)" : "1px solid var(--color-border)",
                        boxShadow: isUnlocked ? "0 4px 14px -4px color-mix(in srgb, var(--color-coral) 20%, transparent)" : "none"
                      }}
                    >
                      <div>
                        {/* Upper Status Bar Context */}
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

                        {/* Text Metadata Details */}
                        <h3 className="font-bold text-base mb-1" style={{ color: "var(--color-ink)" }}>{badge.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                          {badge.description}
                        </p>
                      </div>

                      {/* Lower Status Info Guard */}
                      <div className="border-t pt-3 mt-2 text-[11px] font-semibold flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                        <span style={{ color: isUnlocked ? "var(--color-coral)" : "var(--color-muted)" }}>
                          {isUnlocked ? "✨ Status: Active" : "🔒 Requirement Not Met"}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Missing Info Context Help Box */}
            <div className="sidebar-panel p-4 sm:p-5 rounded-xl flex items-start gap-3" style={{ background: "color-mix(in srgb, var(--color-ink) 2%, transparent)" }}>
              <HelpCircle size={18} className="mt-0.5 shrink-0" style={{ color: "var(--color-coral)" }} />
              <div className="text-xs flex flex-col gap-1">
                <span className="font-bold" style={{ color: "var(--color-ink)" }}>How to request missing badges?</span>
                <p className="leading-relaxed" style={{ color: "var(--color-muted)" }}>
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