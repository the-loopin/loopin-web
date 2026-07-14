"use client";

import { motion } from "framer-motion";
import { BadgeIcon } from "./BadgeIcon";
import { BadgeUI } from "@/lib/data/badge-catalog";

interface BadgeCardProps {
  badge: BadgeUI;
  isUnlocked: boolean;
  onClick: (badge: BadgeUI) => void;
}

export function BadgeCard({ badge, isUnlocked, onClick }: BadgeCardProps) {
  const isLocked = !isUnlocked;

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
      </div>

      <h3 className="font-bold text-base text-[var(--color-ink)] mb-1">{badge.title}</h3>
      <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">{badge.description}</p>

      <div className="mt-auto w-full">
        {isLocked ? (
          <div className="flex justify-between items-center text-xs w-full">
            <span className="font-semibold text-[var(--muted)]">Locked</span>
          </div>
        ) : (
          <div className="flex justify-between items-center text-xs w-full">
            <span className="font-semibold text-[var(--color-teal)]">Unlocked</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
