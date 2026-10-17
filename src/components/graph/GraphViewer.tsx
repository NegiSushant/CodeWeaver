"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import ForceGraph2D, {
  type NodeObject,
  type LinkObject,
} from "react-force-graph-2d";
import { Loader2, RefreshCw, AlertCircle, Info } from "lucide-react";
import type { GraphData, GraphNode, GraphLink, NodeLabel } from "@/types/graph";
import { GraphToolbar } from "./GraphToolbar";
import { NodeDetailCard } from "./NodeDetailCard";

const LABEL_COLORS: Record<NodeLabel, string> = {
  File: "#6366f1", // indigo
  Function: "#22d3ee", // cyan
  Class: "#f59e0b", // amber
  Module: "#10b981", // emerald
  Feature: "#ec4899", // pink
  Person: "#a78bfa", // violet
};

const HIGHLIGHT_COLOR = "#facc15"; // yellow-400
const HIGHLIGHTED_RADIUS_MULTIPLIER = 1.8;
const DEFAULT_RADIUS = 5.5;

interface GraphViewerProps {
  /** Node IDs that were part of the latest reasoning path */
  highlightedNodeIds?: number[];
  /** When true, only displays nodes in highlightedNodeIds and connecting links */
  filterOnlyHighlighted?: boolean;
  /** Whether to show the toolbar with zoom/search controls */
  showControls?: boolean;
  /** Filter nodes by category/label */
  selectedLabelFilter?: string | null;
  /** Callback with computed graph statistics */
  onStatsLoaded?: (stats: {
    nodeCount: number;
    linkCount: number;
    labelCounts: Record<string, number>;
  }) => void;
}

type FGNode = NodeObject<GraphNode>;
type FGLink = LinkObject<GraphNode, GraphLink>;

export function GraphViewer({
  highlightedNodeIds = [],
  filterOnlyHighlighted = false,
  showControls = true,
  selectedLabelFilter = null,
  onStatsLoaded,
}: GraphViewerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(undefined);
  const onStatsLoadedRef = useRef(onStatsLoaded);
  useEffect(() => {
    onStatsLoadedRef.current = onStatsLoaded;
  }, [onStatsLoaded]);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState<{
    nodes: FGNode[];
    links: FGLink[];
  }>({
    nodes: [],
    links: [],
  });
  const [rawNodes, setRawNodes] = useState<GraphNode[]>([]);
  const [rawLinks, setRawLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<FGNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const highlightSet = useMemo(
    () => new Set(highlightedNodeIds.map(Number)),
    [highlightedNodeIds],
  );

  // Resize Observer to match container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fetch graph data
  useEffect(() => {
    let cancelled = false;

    fetch("/api/graph")
      .then((r) => {
        if (!r.ok) throw new Error(`Graph API status ${r.status}`);
        return r.json() as Promise<GraphData>;
      })
      .then((data) => {
        if (cancelled) return;
        const nodes = data.nodes || [];
        const links = data.links || [];

        setRawNodes(nodes);
        setRawLinks(links);

        // Compute statistics
        const labelCounts: Record<string, number> = {};
        for (const n of nodes) {
          labelCounts[n.label] = (labelCounts[n.label] || 0) + 1;
        }

        onStatsLoadedRef.current?.({
          nodeCount: nodes.length,
          linkCount: links.length,
          labelCounts,
        });

        let processedNodes = [...nodes] as FGNode[];
        let processedLinks = [...links] as FGLink[];

        if (filterOnlyHighlighted) {
          const targetIds = new Set(highlightedNodeIds.map(Number));
          processedNodes = processedNodes.filter((n) =>
            targetIds.has(Number(n.id)),
          );
          const activeNodeIds = new Set(
            processedNodes.map((n) => Number(n.id)),
          );
          processedLinks = processedLinks.filter((l) => {
            const s = Number(
              typeof l.source === "object"
                ? (l.source as FGNode).id
                : l.source,
            );
            const t = Number(
              typeof l.target === "object"
                ? (l.target as FGNode).id
                : l.target,
            );
            return activeNodeIds.has(s) && activeNodeIds.has(t);
          });
        }

        setGraphData({ nodes: processedNodes, links: processedLinks });
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load graph");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filterOnlyHighlighted, highlightedNodeIds]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetch("/api/graph")
      .then((r) => {
        if (!r.ok) throw new Error(`Graph API status ${r.status}`);
        return r.json() as Promise<GraphData>;
      })
      .then((data) => {
        const nodes = data.nodes || [];
        const links = data.links || [];
        setRawNodes(nodes);
        setRawLinks(links);
        setGraphData({ nodes: nodes as FGNode[], links: links as FGLink[] });
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load graph");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Auto zoom to fit on initial load or highlight change
  useEffect(() => {
    if (!graphRef.current) return;
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, filterOnlyHighlighted ? 80 : 50);
    }, 450);
    return () => clearTimeout(timer);
  }, [highlightedNodeIds, graphData.nodes.length, filterOnlyHighlighted]);

  // Controls Handlers
  const handleZoomIn = () => {
    if (!graphRef.current) return;
    const current = graphRef.current.zoom();
    graphRef.current.zoom(current * 1.35, 300);
  };

  const handleZoomOut = () => {
    if (!graphRef.current) return;
    const current = graphRef.current.zoom();
    graphRef.current.zoom(current / 1.35, 300);
  };

  const handleResetView = () => {
    if (!graphRef.current) return;
    graphRef.current.zoomToFit(450, 50);
  };

  const handleReheat = () => {
    if (!graphRef.current) return;
    graphRef.current.d3ReheatSimulation();
  };

  const handleFocusNode = (node: GraphNode) => {
    if (!graphRef.current) return;
    const fgNode = graphData.nodes.find((n) => Number(n.id) === Number(node.id));
    if (fgNode && fgNode.x != null && fgNode.y != null) {
      graphRef.current.centerAt(fgNode.x, fgNode.y, 450);
      graphRef.current.zoom(2.8, 450);
    }
  };

  const handleSelectNodeFromSearch = (node: GraphNode) => {
    setSelectedNode(node);
    handleFocusNode(node);
  };

  // Connected neighbors of selected node for illumination
  const selectedNeighbors = useMemo(() => {
    const set = new Set<number>();
    if (!selectedNode) return set;
    set.add(Number(selectedNode.id));
    for (const l of graphData.links) {
      const s = Number(
        typeof l.source === "object" ? (l.source as FGNode).id : l.source,
      );
      const t = Number(
        typeof l.target === "object" ? (l.target as FGNode).id : l.target,
      );
      if (s === Number(selectedNode.id)) set.add(t);
      if (t === Number(selectedNode.id)) set.add(s);
    }
    return set;
  }, [selectedNode, graphData.links]);

  // Node Canvas Painter
  const paintNode = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHighlighted =
        typeof node.id !== "undefined" && highlightSet.has(Number(node.id));
      const isHovered =
        typeof hoveredNode?.id !== "undefined" &&
        Number(hoveredNode?.id) === Number(node.id);
      const isSelected =
        selectedNode !== null && Number(selectedNode.id) === Number(node.id);
      const isNeighborOfSelected =
        selectedNode !== null && selectedNeighbors.has(Number(node.id));

      const isCategoryFiltered =
        selectedLabelFilter !== null && node.label === selectedLabelFilter;
      const isDimmed =
        (selectedLabelFilter !== null && !isCategoryFiltered) ||
        (selectedNode !== null && !isNeighborOfSelected);

      const baseColor = LABEL_COLORS[node.label as NodeLabel] ?? "#94a3b8";
      const r = isHighlighted || isSelected
        ? DEFAULT_RADIUS * HIGHLIGHTED_RADIUS_MULTIPLIER
        : DEFAULT_RADIUS;

      // Glow effect for selected / hovered / highlighted
      if (isSelected || isHighlighted || isHovered || isCategoryFiltered) {
        ctx.save();
        ctx.shadowBlur = isSelected ? 22 : 14;
        ctx.shadowColor = isHighlighted ? HIGHLIGHT_COLOR : baseColor;
        ctx.restore();
      }

      // Outer ring for selected or highlighted nodes
      if (isSelected || isHighlighted) {
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, r + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = isSelected ? "#ffffff" : HIGHLIGHT_COLOR;
        ctx.lineWidth = isSelected ? 2.2 : 1.8;
        ctx.stroke();
      }

      // Category filter ring
      if (isCategoryFiltered && !isSelected && !isHighlighted) {
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, r + 2, 0, 2 * Math.PI);
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Node body
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
      ctx.fillStyle = isDimmed
        ? isDark
          ? "rgba(100, 116, 139, 0.25)"
          : "rgba(160, 174, 192, 0.35)"
        : filterOnlyHighlighted
          ? baseColor
          : isHighlighted
            ? HIGHLIGHT_COLOR
            : baseColor;
      ctx.fill();

      // Label Drawing
      // In full graph mode, only draw prominent labels (Module, Feature) when zoomed out,
      // and draw all labels when zoomed in or on hover/selection to avoid overlapping clutter.
      const isMajorNode = node.label === "Module" || node.label === "Feature";
      const shouldDrawLabel =
        isHovered ||
        isSelected ||
        isHighlighted ||
        isCategoryFiltered ||
        filterOnlyHighlighted ||
        (showLabels && (isMajorNode || (globalScale != null && globalScale >= 1.05)));

      if (shouldDrawLabel && !isDimmed) {
        const fontSize = isSelected || isHighlighted ? 5.5 : isMajorNode ? 4.8 : 3.8;
        ctx.font = `${
          isSelected || isHighlighted || isMajorNode ? "bold " : ""
        }${fontSize}px Inter, -apple-system, sans-serif`;

        const labelY = (node.y ?? 0) + r + fontSize + 1.2;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Text stroke outline for contrast
        ctx.strokeStyle = isDark
          ? "rgba(10, 13, 11, 0.9)"
          : "rgba(255, 255, 255, 0.95)";
        ctx.lineWidth = 2.4;
        ctx.strokeText(node.name ?? "", node.x ?? 0, labelY);

        ctx.fillStyle = isHighlighted
          ? isDark
            ? "#facc15"
            : "#b45309"
          : isMajorNode
            ? isDark
              ? "#ffffff"
              : "#0f172a"
            : isDark
              ? "#e2e8f0"
              : "#1e293b";
        ctx.fillText(node.name ?? "", node.x ?? 0, labelY);
      }
    },
    [
      highlightSet,
      hoveredNode,
      selectedNode,
      selectedLabelFilter,
      showLabels,
      isDark,
      filterOnlyHighlighted,
      selectedNeighbors,
    ],
  );

  // Link Canvas Painter
  const paintLink = useCallback(
    (link: FGLink, ctx: CanvasRenderingContext2D) => {
      const src = link.source as FGNode;
      const tgt = link.target as FGNode;
      const srcId = Number(src.id);
      const tgtId = Number(tgt.id);

      const srcHighlighted = highlightSet.has(srcId);
      const tgtHighlighted = highlightSet.has(tgtId);
      const isOnPath = srcHighlighted && tgtHighlighted;

      const isConnectedToSelected =
        selectedNode !== null &&
        (srcId === Number(selectedNode.id) ||
          tgtId === Number(selectedNode.id));

      const isDimmed =
        selectedNode !== null && !isConnectedToSelected;

      if (isOnPath) {
        ctx.strokeStyle = HIGHLIGHT_COLOR;
        ctx.lineWidth = 1.8;
      } else if (isConnectedToSelected) {
        ctx.strokeStyle = isDark ? "#cce3c0" : "#5e7755";
        ctx.lineWidth = 1.6;
      } else if (isDimmed) {
        ctx.strokeStyle = isDark
          ? "rgba(148, 163, 184, 0.08)"
          : "rgba(100, 116, 139, 0.1)";
        ctx.lineWidth = 0.4;
      } else {
        ctx.strokeStyle = isDark
          ? "rgba(148, 163, 184, 0.28)"
          : "rgba(100, 116, 139, 0.35)";
        ctx.lineWidth = 0.6;
      }

      ctx.beginPath();
      ctx.moveTo(src.x ?? 0, src.y ?? 0);
      ctx.lineTo(tgt.x ?? 0, tgt.y ?? 0);
      ctx.stroke();
    },
    [highlightSet, selectedNode, isDark],
  );

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-transparent">
        <div className="relative flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full border-2 border-[#a3b18a]/30 animate-ping absolute" />
          <div className="h-10 w-10 rounded-2xl bg-[#a3b18a]/20 border border-[#a3b18a]/40 flex items-center justify-center shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#5e7755] dark:text-[#a3b18a]" />
          </div>
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Synthesizing Knowledge Topology
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          Loading nodes, relationships, and AST call hierarchies...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-transparent">
        <div className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-500 border border-red-200 dark:border-red-800 flex items-center justify-center mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Graph Visualization Unavailable
        </h3>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm mb-4">
          {error}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a3b18a] hover:bg-[#93a17a] text-[#0f1410] text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-transparent">
        <div className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
          <Info className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          No Graph Entities Found
        </h3>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm">
          The knowledge graph is currently empty. Run the ingestion pipeline to index the repository.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden select-none">
      {/* Bottom-Left Floating Controls Bar (Never interferes with top legend) */}
      {showControls && (
        <div className="absolute left-4 bottom-4 z-20">
          <GraphToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            onReheat={handleReheat}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((prev) => !prev)}
            nodes={rawNodes}
            onSelectNode={handleSelectNodeFromSearch}
          />
        </div>
      )}

      {/* Floating Hover Tooltip (shown when no node is selected or on different node) */}
      {hoveredNode && (!selectedNode || Number(selectedNode.id) !== Number(hoveredNode.id)) && (
        <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-xs rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-[#151a16]/95 px-3.5 py-2.5 text-xs shadow-xl backdrop-blur-md transition-all animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  LABEL_COLORS[hoveredNode.label as NodeLabel] || "#94a3b8",
              }}
            />
            <span className="font-semibold text-zinc-900 dark:text-white truncate">
              {hoveredNode.name}
            </span>
            <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
              {hoveredNode.label}
            </span>
          </div>

          {hoveredNode.path && (
            <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
              {hoveredNode.path}
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

      {/* Selected Node Details Side Card */}
      {selectedNode && (
        <NodeDetailCard
          node={selectedNode}
          links={rawLinks}
          allNodes={rawNodes}
          onClose={() => setSelectedNode(null)}
          onFocusNode={handleFocusNode}
          onSelectConnectedNode={(node) => {
            setSelectedNode(node);
            handleFocusNode(node);
          }}
        />
      )}

      {/* 2D Canvas */}
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
        onNodeHover={(node) => setHoveredNode((node as FGNode) || null)}
        onNodeClick={(node) => {
          const picked = rawNodes.find(
            (n) => Number(n.id) === Number((node as FGNode).id),
          );
          if (picked) {
            setSelectedNode(picked);
          }
        }}
        nodeRelSize={DEFAULT_RADIUS}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() =>
          isDark ? "rgba(148,163,184,0.4)" : "rgba(100,116,139,0.5)"
        }
        enableNodeDrag
        enableZoomInteraction
        cooldownTicks={100}
        d3AlphaDecay={0.028}
        d3VelocityDecay={0.28}
        onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
      />
    </div>
  );
}
