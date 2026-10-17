"use client";

import { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Type,
  Search,
  X,
  RotateCcw,
} from "lucide-react";
import type { GraphNode, NodeLabel } from "@/types/graph";

const LABEL_COLORS: Record<NodeLabel, string> = {
  File: "#6366f1",
  Function: "#22d3ee",
  Class: "#f59e0b",
  Module: "#10b981",
  Feature: "#ec4899",
  Person: "#a78bfa",
};

interface GraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onReheat: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  nodes: GraphNode[];
  onSelectNode: (node: GraphNode) => void;
}

export function GraphToolbar({
  onZoomIn,
  onZoomOut,
  onResetView,
  onReheat,
  showLabels,
  onToggleLabels,
  nodes,
  onSelectNode,
}: GraphToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matchingNodes = searchQuery.trim()
    ? nodes
        .filter((n) =>
          n.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
        .slice(0, 7)
    : [];

  const handleChooseNode = (node: GraphNode) => {
    onSelectNode(node);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Node Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search nodes (e.g. graph.ts)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-48 sm:w-64 pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white/85 dark:bg-[#151a16]/90 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#a3b18a] focus:border-[#a3b18a] shadow-2xs backdrop-blur-md transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && matchingNodes.length > 0 && (
          <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#151a16]/95 backdrop-blur-md shadow-xl py-1.5 z-50 animate-in fade-in duration-150">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Matches ({matchingNodes.length})
            </div>
            {matchingNodes.map((node) => {
              const color = LABEL_COLORS[node.label] || "#94a3b8";
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleChooseNode(node)}
                  className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {node.name}
                    </p>
                    {node.path && (
                      <p className="text-[10px] text-zinc-400 truncate">
                        {node.path}
                      </p>
                    )}
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border border-black/5 dark:border-white/10"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                    }}
                  >
                    {node.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Control Buttons Group */}
      <div className="flex items-center gap-1 rounded-xl bg-white/85 dark:bg-[#151a16]/90 border border-zinc-200/90 dark:border-zinc-800 p-1 shadow-2xs backdrop-blur-md">
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        <button
          type="button"
          onClick={onResetView}
          title="Fit to Screen"
          aria-label="Reset zoom and fit to screen"
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onReheat}
          title="Re-layout Simulation"
          aria-label="Re-layout nodes"
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        <button
          type="button"
          onClick={onToggleLabels}
          title={showLabels ? "Hide Node Labels" : "Show Node Labels"}
          aria-label="Toggle node labels"
          className={`p-1.5 rounded-lg transition cursor-pointer ${
            showLabels
              ? "bg-[#a3b18a]/20 text-[#2d3a2b] dark:text-[#cce3c0]"
              : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Type className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
