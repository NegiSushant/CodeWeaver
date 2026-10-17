"use client";

import type { NodeLabel } from "@/types/graph";

const GRAPH_ITEMS: { label: NodeLabel; color: string }[] = [
  { label: "Module", color: "#10b981" },
  { label: "Feature", color: "#ec4899" },
  { label: "File", color: "#6366f1" },
  { label: "Function", color: "#22d3ee" },
  { label: "Class", color: "#f59e0b" },
  { label: "Person", color: "#a78bfa" },
];

interface GraphLegendProps {
  activeFilter?: string | null;
  onFilterChange?: (label: string | null) => void;
  className?: string;
  showReasoningPath?: boolean;
}

export function GraphLegend({
  activeFilter,
  onFilterChange,
  className = "",
  showReasoningPath = true,
}: GraphLegendProps) {
  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 ${className}`}
    >
      {/* "All" Filter Pill if interactive */}
      {onFilterChange && (
        <button
          type="button"
          onClick={() => onFilterChange(null)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeFilter === null
              ? "bg-[#a3b18a] text-[#0f1410] shadow-2xs"
              : "bg-zinc-100/90 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700/60"
          }`}
        >
          <span>All Nodes</span>
        </button>
      )}

      {/* Category Pills */}
      {GRAPH_ITEMS.map(({ label, color }) => {
        const isSelected = activeFilter === label;

        return (
          <button
            key={label}
            type="button"
            onClick={() => onFilterChange?.(isSelected ? null : label)}
            disabled={!onFilterChange}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              onFilterChange
                ? "cursor-pointer hover:scale-102"
                : "cursor-default"
            } ${
              isSelected
                ? "ring-2 ring-offset-1 ring-[#a3b18a] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "bg-white/80 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800"
            }`}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full shadow-2xs"
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
          </button>
        );
      })}

      {/* Reasoning Path indicator */}
      {showReasoningPath && (
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-yellow-500/10 border border-yellow-500/25 text-yellow-700 dark:text-yellow-400">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#facc15] shadow-xs" />
          <span>Reasoning path</span>
        </div>
      )}
    </div>
  );
}
