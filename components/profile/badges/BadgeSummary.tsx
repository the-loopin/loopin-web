"use client";

import { motion } from "framer-motion";

interface BadgeSummaryProps {
  unlockedCount: number;
  totalCount: number;
}

export function BadgeSummary({ unlockedCount, totalCount }: BadgeSummaryProps) {
  const progress = totalCount > 0 ? unlockedCount / totalCount : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="profile-panel p-6 rounded-2xl border border-[var(--line)] w-full mb-8"
    >
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-[var(--color-teal)] flex items-center justify-center bg-[color-mix(in_srgb,var(--color-teal)_10%,transparent)] shadow-[0_0_20px_color-mix(in_srgb,var(--color-teal)_20%,transparent)]">
              <span className="text-4xl">👑</span>
            </div>
          </div>
          
          <div className="flex flex-col text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-[var(--color-ink)]">Community Explorer</h2>
            <p className="text-[var(--muted)] text-sm mb-6 max-w-md">Complete activities, connect with others, and explore your city to earn more badges. Your achievements will appear here.</p>
            
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[var(--color-ink)]">{unlockedCount}/{totalCount}</span>
                <span className="text-xs text-[var(--muted)] uppercase tracking-wider">Badges</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col justify-center h-full pt-2">
          <div className="flex justify-between text-xs font-bold text-[var(--muted)] mb-2">
            <span>Collection Progress</span>
            <span>{unlockedCount} / {totalCount} Badges</span>
          </div>
          <div className="h-3 w-full bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-coral)] rounded-full" 
            />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
