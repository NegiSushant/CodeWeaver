"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import ForceGraph2D, {
  type NodeObject,
  type LinkObject,
} from "react-force-graph-2d";
import type { GraphData, GraphNode, GraphLink, NodeLabel } from "@/types/graph";

const LABEL_COLORS: Record<NodeLabel, string> = {
  File: "#6366f1", // indigo
  Function: "#22d3ee", // cyan
  Class: "#f59e0b", // amber
  Module: "#10b981", // emerald
  Feature: "#ec4899", // pink
  Person: "#a78bfa", // violet
};

const HIGHLIGHT_COLOR = "#facc15"; // yellow-400
const HIGHLIGHTED_RADIUS_MULTIPLIER = 2.0;
const DEFAULT_RADIUS = 5;

interface GraphViewerProps {
  /** Node IDs that were part of the latest reasoning path */
  highlightedNodeIds: number[];
  /** When true, only displays nodes in highlightedNodeIds and connecting links */
  filterOnlyHighlighted?: boolean;
}

type FGNode = NodeObject<GraphNode>;
type FGLink = LinkObject<GraphNode, GraphLink>;

export function GraphViewer({
  highlightedNodeIds,
  filterOnlyHighlighted = false,
}: GraphViewerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(undefined);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState<{
    nodes: FGNode[];
    links: FGLink[];
  }>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<FGNode | null>(null);

  const highlightSet = new Set(highlightedNodeIds);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/graph")
      .then((r) => {
        if (!r.ok) throw new Error(`Graph API ${r.status}`);
        return r.json() as Promise<GraphData>;
      })
      .then((data) => {
        if (cancelled) return;
        let nodes = data.nodes as FGNode[];
        let links = data.links as FGLink[];

        if (filterOnlyHighlighted) {
          const targetIds = new Set(highlightedNodeIds.map(Number));
          nodes = nodes.filter((n) => targetIds.has(Number(n.id)));
          const activeNodeIds = new Set(nodes.map((n) => Number(n.id)));
          links = links.filter((l) => {
            const s = Number(
              typeof l.source === "object" ? (l.source as FGNode).id : l.source,
            );
            const t = Number(
              typeof l.target === "object" ? (l.target as FGNode).id : l.target,
            );
            return activeNodeIds.has(s) && activeNodeIds.has(t);
          });
        }

        setGraphData({ nodes, links });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load graph");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterOnlyHighlighted, highlightedNodeIds]);

  useEffect(() => {
    if (!graphRef.current) return;
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, filterOnlyHighlighted ? 80 : 40);
    }, 400);
    return () => clearTimeout(timer);
  }, [highlightedNodeIds, graphData.nodes.length, filterOnlyHighlighted]);

  const paintNode = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D) => {
      const isHighlighted =
        typeof node.id !== "undefined" && highlightSet.has(Number(node.id));
      const isHovered =
        typeof hoveredNode?.id !== "undefined" &&
        Number(hoveredNode?.id) === Number(node.id);
      const baseColor = LABEL_COLORS[node.label as NodeLabel] ?? "#94a3b8";
      const r = isHighlighted
        ? DEFAULT_RADIUS * HIGHLIGHTED_RADIUS_MULTIPLIER
        : DEFAULT_RADIUS;

      // Glow for highlighted / hovered
      if (isHighlighted || isHovered) {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = isHighlighted ? HIGHLIGHT_COLOR : baseColor;
        ctx.restore();
      }

      // Outer ring for highlighted nodes
      if (isHighlighted) {
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, r + 2.5, 0, 2 * Math.PI);
        ctx.strokeStyle = HIGHLIGHT_COLOR;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // Node body
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
      ctx.fillStyle = filterOnlyHighlighted ? baseColor : (isHighlighted ? HIGHLIGHT_COLOR : baseColor);
      ctx.fill();

      // Label
      const fontSize = isHighlighted ? 5 : 3.5;
      ctx.font = `${isHighlighted ? "bold " : ""}${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = isHighlighted
        ? isDark
          ? "#facc15"
          : "#b45309"
        : isDark
          ? "#f1f5f9"
          : "#1e293b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        node.name ?? "",
        node.x ?? 0,
        (node.y ?? 0) + r + fontSize + 1,
      );
    },
    [highlightedNodeIds, hoveredNode, isDark], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const paintLink = useCallback(
    (link: FGLink, ctx: CanvasRenderingContext2D) => {
      const src = link.source as FGNode;
      const tgt = link.target as FGNode;
      const srcHighlighted =
        typeof src.id !== "undefined" && highlightSet.has(Number(src.id));
      const tgtHighlighted =
        typeof tgt.id !== "undefined" && highlightSet.has(Number(tgt.id));
      const isOnPath = srcHighlighted && tgtHighlighted;

      ctx.strokeStyle = isOnPath
        ? HIGHLIGHT_COLOR
        : isDark
          ? "rgba(148,163,184,0.25)"
          : "rgba(100,116,139,0.35)";
      ctx.lineWidth = isOnPath ? 1.5 : 0.6;
      ctx.beginPath();
      ctx.moveTo(src.x ?? 0, src.y ?? 0);
      ctx.lineTo(tgt.x ?? 0, tgt.y ?? 0);
      ctx.stroke();
    },
    [highlightedNodeIds, isDark], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Loading knowledge graph…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm font-medium text-red-500 dark:text-red-400">
            Graph unavailable
          </p>
          <p className="mt-1 text-xs text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* Tooltip */}
      {hoveredNode && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[200px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm transition-colors">
          <p className="font-semibold text-zinc-900 dark:text-white">
            {hoveredNode.name}
          </p>
          <p className="mt-0.5 font-mono text-zinc-500 dark:text-zinc-400">
            {hoveredNode.label}
          </p>
          {hoveredNode.path && (
            <p className="mt-1 break-all text-zinc-500 dark:text-zinc-400">
              {hoveredNode.path}
            </p>
          )}
          {hoveredNode.description && (
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">
              {hoveredNode.description}
            </p>
          )}
          {typeof hoveredNode.id !== "undefined" &&
            highlightSet.has(Number(hoveredNode.id)) && (
              <span className="mt-1.5 inline-block rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">
                In reasoning path
              </span>
            )}
        </div>
      )}

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => "replace"}
        nodeLabel={() => ""}
        onNodeHover={(node) => setHoveredNode(node as FGNode | null)}
        nodeRelSize={DEFAULT_RADIUS}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() => "rgba(148,163,184,0.5)"}
        enableNodeDrag
        enableZoomInteraction
        cooldownTicks={80}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.3}
        onEngineStop={() => graphRef.current?.zoomToFit(400, 40)}
      />
    </div>
  );
}
