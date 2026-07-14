"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Search, Loader2 } from "lucide-react";
import { getAvailableInterests } from "@/lib/api";

export interface InterestsSelectorProps {
  selectedIds: string[];
  onChange: (newIds: string[]) => void;
}

export function InterestsSelector({ selectedIds, onChange }: InterestsSelectorProps) {
  const { data: interests, isLoading, error } = useQuery({
    queryKey: ["availableInterests"],
    queryFn: getAvailableInterests,
    staleTime: 5 * 60 * 1000,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredInterests = useMemo(() => {
    if (!interests) return [];
    if (!searchQuery.trim()) return interests;
    return interests.filter(
      (interest) =>
        interest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interest.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [interests, searchQuery]);

  const toggleInterest = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm py-4" style={{ color: "var(--color-muted)" }}>
        <Loader2 className="animate-spin" size={16} /> Loading interests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 py-4">
        Failed to load interests. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }}>
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search interests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border px-10 py-2.5 text-sm outline-none transition-colors"
          style={{ 
            color: "var(--color-ink)", 
            backgroundColor: "var(--background)",
            borderColor: "var(--color-border)"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--color-coral)"}
          onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
        />
      </div>

      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-1 scrollbar-thin">
        {filteredInterests.length === 0 ? (
          <p className="text-sm p-2" style={{ color: "var(--color-muted)" }}>No interests found.</p>
        ) : (
          filteredInterests.map((interest) => {
            const id = interest.id || "";
            const isSelected = selectedIds.includes(id);

            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleInterest(id)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200"
                style={{
                  borderColor: isSelected ? "var(--color-coral)" : "var(--color-border)",
                  backgroundColor: isSelected ? "var(--color-coral)" : "color-mix(in srgb, var(--color-ink) 3%, transparent)",
                  color: isSelected ? "white" : "var(--color-ink)",
                  boxShadow: isSelected ? "0 4px 14px 0 color-mix(in srgb, var(--color-coral) 20%, transparent)" : "none"
                }}
              >
                {isSelected && <Check size={14} className="text-white" />}
                {interest.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
