"use client";

import { useState } from "react";
import { X, Focus, Copy, Check } from "lucide-react";
import type { GraphNode, GraphLink, NodeLabel } from "@/types/graph";

const LABEL_COLORS: Record<NodeLabel, string> = {
  File: "#6366f1",
  Function: "#22d3ee",
  Class: "#f59e0b",
  Module: "#10b981",
  Feature: "#ec4899",
  Person: "#a78bfa",
};

interface NodeDetailCardProps {
  node: GraphNode;
  links: GraphLink[];
  allNodes: GraphNode[];
  onClose: () => void;
  onFocusNode: (node: GraphNode) => void;
  onSelectConnectedNode: (node: GraphNode) => void;
}

export function NodeDetailCard({
  node,
  links,
  allNodes,
  onClose,
  onFocusNode,
  onSelectConnectedNode,
}: NodeDetailCardProps) {
  const [copied, setCopied] = useState(false);

  const color = LABEL_COLORS[node.label] || "#94a3b8";

  // Find incoming and outgoing connections
  const connectedLinks = links.filter((l) => {
    const s = Number(typeof l.source === "object" ? (l.source as GraphNode).id : l.source);
    const t = Number(typeof l.target === "object" ? (l.target as GraphNode).id : l.target);
    return s === Number(node.id) || t === Number(node.id);
  });

  const connectedNeighbors = connectedLinks.map((l) => {
    const s = Number(typeof l.source === "object" ? (l.source as GraphNode).id : l.source);
    const t = Number(typeof l.target === "object" ? (l.target as GraphNode).id : l.target);
    const neighborId = s === Number(node.id) ? t : s;
    const neighborNode = allNodes.find((n) => Number(n.id) === neighborId);
    const isOutgoing = s === Number(node.id);
    return {
      node: neighborNode,
      relationship: l.type,
      direction: isOutgoing ? "outgoing" : "incoming",
    };
  }).filter((item) => Boolean(item.node));

  const handleCopyPath = () => {
    if (!node.path) return;
    navigator.clipboard.writeText(node.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="absolute right-4 top-4 z-30 w-80 sm:w-96 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-[#121614]/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-right-4">
      {/* Top Header */}
      <div className="flex items-start justify-between p-4 border-b border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: `${color}15`,
                color: color,
                borderColor: `${color}30`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {node.label}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              ID: {node.id}
            </span>
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {node.name}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body Information */}
      <div className="p-4 space-y-3.5 max-h-[60vh] overflow-y-auto">
        {/* Path field */}
        {node.path && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              <span>File Path</span>
              <button
                type="button"
                onClick={handleCopyPath}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-[#5e7755] dark:hover:text-[#a3b18a] transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-mono p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 break-all">
              {node.path}
            </p>
          </div>
        )}

        {/* Description */}
        {node.description && (
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Description
            </span>
            <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {node.description}
            </p>
          </div>
        )}

        {/* Connected Relationships */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            <span>Connections</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {connectedNeighbors.length}
            </span>
          </div>

          {connectedNeighbors.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">No direct connections found</p>
          ) : (
            <div className="space-y-1.5">
              {connectedNeighbors.slice(0, 8).map((item, idx) => {
                if (!item.node) return null;
                const nColor = LABEL_COLORS[item.node.label] || "#94a3b8";
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => item.node && onSelectConnectedNode(item.node)}
                    className="w-full flex items-center justify-between p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-[#a3b18a]/60 hover:bg-[#a3b18a]/10 transition text-left cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span className="font-mono text-[9px] uppercase px-1 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {item.relationship}
                        </span>
                        <span>{item.direction === "outgoing" ? "→" : "←"}</span>
                      </div>
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-[#2d3a2b] dark:group-hover:text-[#cce3c0] mt-0.5">
                        {item.node.name}
                      </p>
                    </div>

                    <span
                      className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${nColor}20`,
                        color: nColor,
                      }}
                    >
                      {item.node.label}
                    </span>
                  </button>
                );
              })}
              {connectedNeighbors.length > 8 && (
                <p className="text-[10px] text-zinc-400 text-center pt-1 font-mono">
                  + {connectedNeighbors.length - 8} more connections
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onFocusNode(node)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a3b18a] hover:bg-[#93a17a] text-[#0f1410] font-semibold text-xs transition shadow-2xs active:scale-95 cursor-pointer"
        >
          <Focus className="h-3.5 w-3.5" />
          <span>Center on Node</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-medium transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
