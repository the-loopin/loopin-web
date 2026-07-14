"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BadgeUI } from "@/lib/data/badge-catalog";
import { X } from "lucide-react";
import { useEffect } from "react";
import { BadgeIcon } from "./BadgeIcon";

interface BadgeModalProps {
  badge: BadgeUI | null;
  isUnlocked?: boolean;
  onClose: () => void;
}

export function BadgeModal({ badge, isUnlocked = false, onClose }: BadgeModalProps) {
  const isLocked = !isUnlocked;

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
                  {isLocked ? (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-[var(--color-ink)]">Status</span>
                      <span className="font-bold text-[var(--muted)]">Locked</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-[var(--color-ink)]">Status</span>
                      <span className="font-bold text-[var(--color-teal)]">Unlocked</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
