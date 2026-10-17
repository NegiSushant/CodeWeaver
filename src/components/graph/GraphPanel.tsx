"use client";

import dynamic from "next/dynamic";
import { GraphLegend } from "./GraphLegend";

const GraphViewer = dynamic(
  () => import("./GraphViewer").then((m) => ({ default: m.GraphViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    ),
  },
);

interface GraphPanelProps {
  highlightedNodeIds: number[];
}

export function GraphPanel({ highlightedNodeIds }: GraphPanelProps) {
  const hasHighlights = highlightedNodeIds.length > 0;

  return (
    <div className="flex h-full flex-col border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-zinc-50/60 dark:bg-zinc-900/30">
        <div className="flex items-center gap-2">
          {/* Graph icon */}
          <svg
            className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <circle cx="5" cy="12" r="2" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="19" cy="19" r="2" />
            <line x1="7" y1="11.5" x2="17" y2="6" />
            <line x1="7" y1="12.5" x2="17" y2="18" />
          </svg>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Knowledge Graph
          </h2>
        </div>

        {hasHighlights && (
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 border border-yellow-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400" />
            <span className="text-[11px] font-medium text-yellow-600 dark:text-yellow-400">
              {highlightedNodeIds.length} nodes in path
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-transparent">
        <GraphLegend />
      </div>

      {/* Canvas area */}
      <div className="relative flex-1">
        <GraphViewer highlightedNodeIds={highlightedNodeIds} />
      </div>
    </div>
  );
}
