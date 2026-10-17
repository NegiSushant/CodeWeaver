"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MessageSquare,
  Network,
  Boxes,
  GitFork,
  Layers,
  Sparkles,
} from "lucide-react";
import { GraphLegend } from "@/components/graph/GraphLegend";

const GraphViewer = dynamic(
  () =>
    import("@/components/graph/GraphViewer").then((m) => ({
      default: m.GraphViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="h-10 w-10 animate-spin rounded-2xl border-2 border-[#a3b18a] border-t-transparent mb-3" />
        <span className="text-xs text-zinc-500 font-mono">
          Loading Knowledge Graph...
        </span>
      </div>
    ),
  },
);

export default function GraphPage() {
  const [stats, setStats] = useState<{
    nodeCount: number;
    linkCount: number;
    labelCounts: Record<string, number>;
  }>({
    nodeCount: 0,
    linkCount: 0,
    labelCounts: {},
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleStatsLoaded = useCallback(
    (newStats: {
      nodeCount: number;
      linkCount: number;
      labelCounts: Record<string, number>;
    }) => {
      setStats(newStats);
    },
    [],
  );

  return (
    <div className="flex h-[calc(100vh-61px)] flex-col bg-[#fbf9f5] dark:bg-[#0a0d0b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 overflow-hidden">
      {/* Top Header Bar */}
      <div className="border-b border-zinc-200/80 dark:border-zinc-850 px-4 sm:px-8 py-3.5 bg-white/80 dark:bg-[#111613]/80 backdrop-blur-md shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Description */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#a3b18a]/20 text-[#2d3a2b] dark:text-[#cce3c0] border border-[#a3b18a]/30 shadow-2xs">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Knowledge Graph
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#a3b18a]/20 text-[#2d3a2b] dark:text-[#cce3c0] border border-[#a3b18a]/35 shadow-2xs">
                  <Sparkles className="h-2.5 w-2.5" />
                  Interactive
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Explore architectural topology, module boundaries, AST function calls, and cross-file relationships
              </p>
            </div>
          </div>

          {/* Quick Metrics & Action */}
          <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
            {/* Live Stats Chips */}
            {stats.nodeCount > 0 && (
              <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-zinc-200/80 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/70 dark:bg-zinc-850/60 border border-zinc-200/50 dark:border-zinc-750">
                  <Boxes className="h-3.5 w-3.5 text-[#5e7755] dark:text-[#a3b18a]" />
                  <span>{stats.nodeCount} Entities</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/70 dark:bg-zinc-850/60 border border-zinc-200/50 dark:border-zinc-750">
                  <GitFork className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{stats.linkCount} Links</span>
                </div>
                {stats.labelCounts["Module"] && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/70 dark:bg-zinc-850/60 border border-zinc-200/50 dark:border-zinc-750">
                    <Layers className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{stats.labelCounts["Module"]} Modules</span>
                  </div>
                )}
              </div>
            )}

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#a3b18a] hover:bg-[#93a17a] dark:bg-[#a3b18a] dark:hover:bg-[#b5cca7] text-[#0f1410] shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              <MessageSquare className="h-3.5 w-3.5 stroke-[2.2]" />
              <span>Open Playground</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-3 sm:p-5 flex flex-col min-h-0">
        <div className="relative flex-1 min-h-0 rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-850 bg-white/60 dark:bg-[#0e120f]/80 backdrop-blur-md shadow-sm overflow-hidden flex flex-col">
          {/* Subtle Grid Dot Matrix Background */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-40 dark:opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              color: "#94a3b8",
            }}
          />

          {/* Top Sub-bar with Legend - guaranteed min-h and shrink-0 to prevent any clipping */}
          <div className="shrink-0 relative z-20 border-b border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-[#121614]/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between min-h-12.5">
            <GraphLegend
              activeFilter={selectedCategory}
              onFilterChange={setSelectedCategory}
              showReasoningPath={true}
            />
          </div>

          {/* Interactive Graph Engine */}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden z-10">
            <GraphViewer
              highlightedNodeIds={[]}
              filterOnlyHighlighted={false}
              showControls={true}
              selectedLabelFilter={selectedCategory}
              onStatsLoaded={handleStatsLoaded}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
