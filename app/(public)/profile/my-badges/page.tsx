"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, EmptyState } from "@/app/site";
import { BADGE_UI_CATALOG, BadgeUI, BadgeCategory } from "@/lib/data/badge-catalog";
import { BadgeCard } from "@/components/profile/badges/BadgeCard";
import { BadgeSummary } from "@/components/profile/badges/BadgeSummary";
import { BadgeModal } from "@/components/profile/badges/BadgeModal";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useBadges } from "@/hooks/useBadges";

type FilterStatus = "All" | "Earned" | "Locked";

export default function MyBadgesPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory | "All">("All");
  const [selectedBadge, setSelectedBadge] = useState<BadgeUI | null>(null);

  const { data: myBadges, isPending, isError } = useBadges();
  const unlockedIds = useMemo(() => myBadges || [], [myBadges]);

  const categories = ["All", "Activity", "Community", "Creator", "Social", "Events", "Special"] as const;

  const filteredBadges = useMemo(() => {
    return BADGE_UI_CATALOG.filter((badge) => {
      const isUnlocked = unlockedIds.includes(badge.id);
      const statusMatch = 
        statusFilter === "All" ? true :
        statusFilter === "Earned" ? isUnlocked :
        !isUnlocked;
      
      const categoryMatch = 
        categoryFilter === "All" ? true :
        badge.category === categoryFilter;

      return statusMatch && categoryMatch;
    });
  }, [statusFilter, categoryFilter, unlockedIds]);

  // Featured badges are a subset of unlocked badges for the top scroller
  const featuredBadges = useMemo(() => {
    return BADGE_UI_CATALOG.filter(b => unlockedIds.includes(b.id)).slice(0, 5);
  }, [unlockedIds]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Link href="/profile" className="inline-flex items-center text-[var(--muted)] hover:text-[var(--color-ink)] transition-colors mb-6 text-sm font-semibold">
        <ChevronLeft size={16} className="mr-1" /> Back to Profile
      </Link>

      <PageHeader 
        title="🏆 My Badges" 
        subtitle="Track your achievements, milestones, and community contributions."
      />

      {isPending ? (
        <div className="mb-8">
          <div className="h-48 w-full animate-pulse bg-[var(--line)] rounded-xl" />
        </div>
      ) : isError ? (
        <div className="p-6 mb-8 rounded-[20px] border border-red-500/20 bg-red-500/5 text-sm text-red-500">
          Unable to load your badges. Please try again later.
        </div>
      ) : (
        <>
          <BadgeSummary 
            unlockedCount={unlockedIds.length} 
            totalCount={BADGE_UI_CATALOG.length} 
          />

          {/* Featured Badges (Horizontal Scroll) */}
          {featuredBadges.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-[var(--color-ink)] mb-4">Featured Badges</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
                {featuredBadges.map(badge => (
                  <div key={`featured-${badge.id}`} className="min-w-[280px] snap-center">
                    <BadgeCard badge={badge} isUnlocked={true} onClick={setSelectedBadge} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Status segmented control */}
            <div className="flex bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] p-1 rounded-lg border border-[var(--line)]">
              {(["All", "Earned", "Locked"] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    statusFilter === status 
                      ? "bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm" 
                      : "text-[var(--muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                    categoryFilter === category
                      ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                      : "bg-[var(--color-paper)] text-[var(--muted)] border-[var(--line)] hover:border-[var(--color-ink)]/30 hover:text-[var(--color-ink)]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Badge Grid */}
          <AnimatePresence mode="wait">
            {filteredBadges.length > 0 ? (
              <motion.div
                key={`${statusFilter}-${categoryFilter}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {filteredBadges.map((badge) => (
                  <BadgeCard 
                    key={badge.id} 
                    badge={badge} 
                    isUnlocked={unlockedIds.includes(badge.id)} 
                    onClick={setSelectedBadge} 
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState>
                  <div className="text-center py-8">
                    <p className="text-4xl mb-4">🔍</p>
                    <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">No badges found</h3>
                    <p className="mb-6">Try adjusting your filters or keep exploring to unlock more badges.</p>
                  </div>
                </EmptyState>
              </motion.div>
            )}
          </AnimatePresence>

          <BadgeModal 
            badge={selectedBadge} 
            isUnlocked={selectedBadge ? unlockedIds.includes(selectedBadge.id) : false}
            onClose={() => setSelectedBadge(null)} 
          />
        </>
      )}
    </div>
  );
}
