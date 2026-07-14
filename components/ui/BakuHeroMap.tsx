"use client";

import dynamic from "next/dynamic";
import { EventCardItem } from "@/components/EventSlider/EventSlider";

const BakuHeroMapInner = dynamic(() => import("./BakuHeroMapInner"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full flex items-center justify-center min-h-[420px] rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(168,85,247,0.15)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Loading 3D Map...</span>
      </div>
    </div>
  ),
});

type BakuHeroMapProps = {
  opportunities?: EventCardItem[];
};

export default function BakuHeroMap({ opportunities = [] }: BakuHeroMapProps) {
  return <BakuHeroMapInner opportunities={opportunities} />;
}
