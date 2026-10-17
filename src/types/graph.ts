// ────────────────────────────────────────────────────────────────────────────
// Graph shared types used by API routes, tools, and frontend components
// ────────────────────────────────────────────────────────────────────────────

/** Node labels that exist in the FalkorDB codeweaver graph */
export type NodeLabel =
  | "File"
  | "Function"
  | "Class"
  | "Module"
  | "Feature"
  | "Person";

/** Relationship types in the graph */
export type RelationshipType =
  | "BELONGS_TO"
  | "CALLS"
  | "USES"
  | "IMPLEMENTS"
  | "OWNED_BY"
  | "RELATED_TO";

/** A node as returned by the /api/graph endpoint */
export interface GraphNode {
  id: number;
  name: string;
  label: NodeLabel;
  path?: string;
  description?: string;
}

/** A directed link as returned by the /api/graph endpoint */
export interface GraphLink {
  source: number;
  target: number;
  type: RelationshipType;
}

/** Full graph payload returned by GET /api/graph */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Structured tool result that every graph tool must return.
 * `data` is the human-readable answer payload; `nodeIds` are the FalkorDB
 * internal IDs of every node that was touched/returned.
 */
export interface ToolResult<T = unknown> {
  data: T;
  nodeIds: number[];
}
