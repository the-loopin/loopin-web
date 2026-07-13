"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/lib/data/mock-badges";
import { X } from "lucide-react";
import { useEffect } from "react";
import { BadgeIcon } from "./BadgeIcon";

interface BadgeModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export function BadgeModal({ badge, onClose }: BadgeModalProps) {
  const isLocked = badge?.status === "locked";

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (badge) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [badge]);

  return (
    <AnimatePresence>
      {badge && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="relative w-full max-w-md bg-[var(--color-paper)] border border-[var(--line)] rounded-2xl shadow-2xl p-6 pointer-events-auto"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-[var(--color-ink)]" />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <div className="mb-6">
                  <BadgeIcon iconName={badge.icon} rarity={badge.rarity} size={96} isLocked={isLocked} />
                </div>
                
                <div className="mb-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-ink)_5%,transparent)] text-[var(--color-ink)] uppercase tracking-wider">
                    {badge.category} • {badge.rarity}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-[var(--color-ink)] mb-2">{badge.title}</h2>
                <p className="text-[var(--muted)] mb-6 max-w-[280px] leading-relaxed">
                  {badge.description}
                </p>

                <div className="w-full bg-[color-mix(in_srgb,var(--color-ink)_3%,transparent)] rounded-xl p-4 mb-6 border border-[var(--line)]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-[var(--color-ink)]">Reward</span>
                    <span className="font-bold text-[var(--color-coral)]">+{badge.xp} XP</span>
                  </div>
                  
                  {isLocked && badge.maxProgress !== undefined ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm font-semibold text-[var(--muted)]">
                        <span>Progress</span>
                        <span>{badge.progress} / {badge.maxProgress}</span>
                      </div>
                      <div className="h-3 w-full bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(badge.progress! / badge.maxProgress) * 100}%` }}
                          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-[var(--muted)] rounded-full" 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-[var(--color-ink)]">Status</span>
                      <span className="font-bold text-[var(--color-teal)]">
                        Unlocked on {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  )}
                </div>

                {isLocked ? (
                  <button className="primary-button w-full" onClick={onClose}>
                    Keep exploring!
                  </button>
                ) : (
                  <button className="secondary-button w-full" onClick={onClose}>
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
