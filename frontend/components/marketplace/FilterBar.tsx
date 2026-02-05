"use client";

import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterCategory = "local" | "predictions";

const filters: { id: FilterCategory; label: string }[] = [
  { id: "local", label: "Local" },
  { id: "predictions", label: "Predictions" },
];

interface FilterBarProps {
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  onSettingsClick?: () => void;
}

export default function FilterBar({ activeFilter, onFilterChange, onSettingsClick }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200",
              activeFilter === filter.id
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
