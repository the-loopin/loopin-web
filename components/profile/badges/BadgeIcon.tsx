import React from "react";
import { BadgeRarity } from "@/lib/data/badge-catalog";
import {
  Hand,
  Medal,
  Heart,
  MessageCircle,
  Users,
  Map,
  Flame,
  Award,
  Star,
  TrendingUp,
  Ticket,
  Gift,
  HelpCircle,
  LucideIcon,
  Sparkles,
  CheckCircle2,
  Flag
} from "lucide-react";

interface BadgeIconProps {
  iconName: string;
  rarity: BadgeRarity;
  size?: number;
  className?: string;
  isLocked?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  "hand": Hand,
  "medal": Medal,
  "heart": Heart,
  "message": MessageCircle,
  "users": Users,
  "map": Map,
  "flame": Flame,
  "award": Award,
  "star": Star,
  "trending": TrendingUp,
  "ticket": Ticket,
  "gift": Gift,
  "secret": HelpCircle,
  "sparkles": Sparkles,
  "check": CheckCircle2,
  "flag": Flag,
};

export function BadgeIcon({ iconName, rarity, size = 64, className = "", isLocked = false }: BadgeIconProps) {
  const IconComponent = iconMap[iconName] || Star;

  // Define rarity styles matching the soft-glow glassmorphism aesthetic
  const styles = {
    common: {
      stroke: "#94a3b8", // Brighter silver/grey so it doesn't blend in dark mode
      strokeOpacity: 0.7,
      iconColor: "#ffffff",
      bgGradient: "url(#commonGlass)",
      glowFilter: "",
    },
    rare: {
      stroke: "var(--color-teal)",
      strokeOpacity: 0.9,
      iconColor: "#ffffff",
      bgGradient: "url(#rareGlass)",
      glowFilter: "url(#rareGlow)",
    },
    epic: {
      stroke: "var(--color-coral)",
      strokeOpacity: 0.9,
      iconColor: "#ffffff",
      bgGradient: "url(#epicGlass)",
      glowFilter: "url(#epicGlow)",
    },
    legendary: {
      stroke: "#fbbf24", // Vibrant gold
      strokeOpacity: 1.0,
      iconColor: "#ffffff",
      bgGradient: "url(#legendaryGlass)",
      glowFilter: "url(#legendaryGlow)",
    },
  };

  const currentStyle = styles[rarity];

  // Define SVG Paths for frames
  const frames = {
    common: "M 50 5 A 45 45 0 1 0 50 95 A 45 45 0 1 0 50 5 Z", // Circle
    rare: "M 50 5 L 89 27.5 L 89 72.5 L 50 95 L 11 72.5 L 11 27.5 Z", // Hexagon
    epic: "M 50 5 L 90 20 L 90 60 Q 90 90 50 95 Q 10 90 10 60 L 10 20 Z", // Shield
    legendary: "M 50 5 L 61 35 L 95 35 L 67 55 L 78 85 L 50 65 L 22 85 L 33 55 L 5 35 L 39 35 Z", // Star
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          {/* Glassmorphic semi-transparent gradients - slightly more opaque for rich tint */}
          <linearGradient id="commonGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="rareGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-teal)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-teal)" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="epicGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-coral)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-coral)" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="legendaryGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
          </linearGradient>

          {/* SVG Glow Filters for maximum rendering compatibility and premium glow */}
          <filter id="rareGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="epicGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="legendaryGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {isLocked ? (
          // Locked Badge styling (empty silhouette with dashed border)
          <>
            <path 
              d={frames[rarity]} 
              fill="rgba(255, 255, 255, 0.02)" 
              stroke="var(--color-border)" 
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinejoin="round"
              strokeOpacity="0.4"
            />
          </>
        ) : (
          // Unlocked Badge styling (Vibrant gradient and glow)
          <>
            {/* Glowing outer stroke layer */}
            {rarity !== "common" && (
              <path 
                d={frames[rarity]} 
                fill="none" 
                stroke={currentStyle.stroke} 
                strokeWidth="5"
                strokeLinejoin="round"
                strokeOpacity="0.3"
                filter={currentStyle.glowFilter}
              />
            )}
            
            {/* Main Glass Frame */}
            <path 
              d={frames[rarity]} 
              fill={currentStyle.bgGradient} 
              stroke={currentStyle.stroke} 
              strokeWidth="3.2"
              strokeLinejoin="round"
              strokeOpacity={currentStyle.strokeOpacity}
            />

            {/* Inner Reflective Border Detail */}
            <path 
              d={frames[rarity]} 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="1" 
              strokeOpacity="0.2"
              transform="scale(0.88) translate(6.8, 6.8)"
            />
          </>
        )}
      </svg>
      
      {/* Icon placed perfectly in the center */}
      <div 
        className="relative z-10 flex items-center justify-center text-white"
        style={{ 
          opacity: isLocked ? 0.25 : 0.95,
          filter: !isLocked && rarity !== "common" ? `drop-shadow(0 0 2px rgba(255,255,255,0.5))` : undefined
        }}
      >
        <IconComponent size={size * 0.38} strokeWidth={2.3} />
      </div>
    </div>
  );
}
