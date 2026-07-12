"use client";

import { motion } from "framer-motion";
import { BadgeIcon } from "./BadgeIcon";
import { Badge } from "@/lib/data/mock-badges";

interface BadgeCardProps {
  badge: Badge;
  onClick: (badge: Badge) => void;
}

export function BadgeCard({ badge, onClick }: BadgeCardProps) {
  const isLocked = badge.status === "locked";

  return (
    <motion.button
      onClick={() => onClick(badge)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col p-4 w-full rounded-xl border transition-colors text-left bg-[color-mix(in_srgb,var(--color-ink)_2%,transparent)]
        ${isLocked ? "border-[var(--line)] opacity-80" : "border-[var(--color-teal)]/30 hover:border-[var(--color-teal)]/60"}
      `}
    >
      <div className="flex justify-between items-start mb-4 w-full">
        <BadgeIcon iconName={badge.icon} rarity={badge.rarity} size={48} isLocked={isLocked} />
        <div className="text-xs font-bold px-2 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] text-[var(--color-ink)]">
          +{badge.xp} XP
        </div>
      </div>

      <h3 className="font-bold text-base text-[var(--color-ink)] mb-1">{badge.title}</h3>
      <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">{badge.description}</p>

      <div className="mt-auto w-full">
        {isLocked && badge.maxProgress !== undefined ? (
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-xs font-semibold text-[var(--muted)]">
              <span>{badge.progress} / {badge.maxProgress}</span>
              <span>Locked</span>
            </div>
            <div className="h-2 w-full bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--muted)] rounded-full" 
                style={{ width: `${(badge.progress! / badge.maxProgress) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center text-xs w-full">
            <span className="font-semibold text-[var(--color-teal)]">Unlocked</span>
            <span className="text-[var(--muted)]">
              {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
