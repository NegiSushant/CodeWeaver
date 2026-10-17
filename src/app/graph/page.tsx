"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MessageSquare, Network } from "lucide-react";
import { GraphLegend } from "@/components/graph/GraphLegend";

const GraphViewer = dynamic(
  () =>
    import("@/components/graph/GraphViewer").then((m) => ({
      default: m.GraphViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a3b18a] border-t-transparent" />
          <span className="text-xs text-zinc-500 font-mono">
            Loading Knowledge Graph...
          </span>
        </div>
      </div>
    ),
  },
);

export default function GraphPage() {
  return (
    <div className="flex h-[calc(100vh-61px)] flex-col bg-[#fbf9f5] dark:bg-[#0c0f0d] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 px-5 sm:px-8 py-3.5 bg-white/70 dark:bg-[#121614]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a3b18a]/20 text-[#2d3a2b] dark:text-[#cce3c0] border border-[#a3b18a]/30">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Knowledge Graph
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[#a3b18a]/20 text-[#2d3a2b] dark:text-[#cce3c0] border border-[#a3b18a]/30">
                Interactive
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive structural map of codebase entities, functions, classes, and cross-module dependencies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#a3b18a] hover:bg-[#93a17a] dark:bg-[#a3b18a] dark:hover:bg-[#b5cca7] text-[#0f1410] shadow-2xs hover:shadow-xs transition active:scale-95"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Open Playground</span>
          </Link>
        </div>
      </div>

      {/* Legend & Controls bar */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 px-3 sm:px-6">
        <GraphLegend />
      </div>

      {/* Full-screen Canvas */}
      <div className="relative flex-1 bg-white/40 dark:bg-[#0c0f0d]/60">
        <GraphViewer highlightedNodeIds={[]} filterOnlyHighlighted={false} />
      </div>
    </div>
  );
}
