"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { X, Network, Sparkles } from "lucide-react";
import { GraphLegend } from "@/components/graph/GraphLegend";
import type { GraphData } from "@/types/graph";

const GraphViewer = dynamic(
  () =>
    import("@/components/graph/GraphViewer").then((m) => ({
      default: m.GraphViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#a3b18a] border-t-transparent" />
      </div>
    ),
  },
);

interface ReasoningPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeIds: number[];
}

export function ReasoningPathModal({
  isOpen,
  onClose,
  nodeIds,
}: ReasoningPathModalProps) {
  const [fallbackNodeIds, setFallbackNodeIds] = useState<number[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // If nodeIds was empty, automatically load the architecture module & feature nodes so the user gets an intuitive visual subgraph.
  useEffect(() => {
    let cancelled = false;
    if (isOpen && nodeIds.length === 0 && fallbackNodeIds.length === 0) {
      fetch("/api/graph")
        .then((res) => res.json())
        .then((data: GraphData) => {
          if (cancelled) return;
          const archNodes = (data.nodes || []).filter(
            (n) => n.label === "Module" || n.label === "Feature",
          );
          if (archNodes.length > 0) {
            setFallbackNodeIds(archNodes.map((n) => Number(n.id)));
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, nodeIds, fallbackNodeIds.length]);

  if (!isOpen) return null;

  const effectiveNodeIds = nodeIds.length > 0 ? nodeIds : fallbackNodeIds;
  const isFallback = nodeIds.length === 0 && fallbackNodeIds.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl h-[82vh] flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121614] shadow-2xl overflow-hidden transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-5 py-3.5 bg-zinc-50/70 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#a3b18a]/20 text-[#2d3a2b] dark:text-[#cce3c0] border border-[#a3b18a]/30">
              <Network className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Reasoning Subgraph
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#a3b18a]/20 px-2 py-0.5 text-[11px] font-medium text-[#2d3a2b] dark:text-[#cce3c0] border border-[#a3b18a]/30">
                  <Sparkles className="h-3 w-3" />
                  {effectiveNodeIds.length}{" "}
                  {effectiveNodeIds.length === 1 ? "Node" : "Nodes"}
                  {isFallback && " (Architecture)"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isFallback
                  ? "Codebase architecture modules & feature nodes traversed by CodeWeaver"
                  : "Specific graph entities & relationships traversed to formulate this response"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/20">
          <GraphLegend />
        </div>

        {/* Graph Content */}
        <div className="relative flex-1 bg-zinc-50/30 dark:bg-[#0c0f0d]/50">
          {effectiveNodeIds.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 mb-3">
                <Network className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                No specific graph nodes were traversed
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
                This answer was formulated directly or without querying specific code graph nodes.
              </p>
            </div>
          ) : (
            <GraphViewer
              highlightedNodeIds={effectiveNodeIds}
              filterOnlyHighlighted={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
