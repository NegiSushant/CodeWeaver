import { NextResponse } from "next/server";
import { getCodeGraph } from "@/lib/falkordb";
import type { GraphData, GraphNode, GraphLink, NodeLabel, RelationshipType } from "@/types/graph";

interface RawNodeRow {
  id: number;
  name: string;
  label: string;
  path?: string;
  description?: string;
}

interface RawLinkRow {
  source: number;
  target: number;
  type: string;
}


export async function GET() {
  try {
    const graph = await getCodeGraph();

    const nodeResult = await graph.query(`
      MATCH (n)
      WHERE n.name IS NOT NULL
      RETURN
        ID(n)              AS id,
        labels(n)[0]       AS label,
        n.name             AS name,
        n.path             AS path,
        n.description      AS description
      LIMIT 500
    `);

    const nodes: GraphNode[] = ((nodeResult.data ?? []) as RawNodeRow[]).map(
      (row) => ({
        id: row.id,
        name: row.name ?? "Unknown",
        label: (row.label ?? "File") as NodeLabel,
        ...(row.path ? { path: row.path } : {}),
        ...(row.description ? { description: row.description } : {}),
      }),
    );
    
    const linkResult = await graph.query(`
      MATCH (a)-[r]->(b)
      WHERE a.name IS NOT NULL AND b.name IS NOT NULL
      RETURN
        ID(a)    AS source,
        ID(b)    AS target,
        type(r)  AS type
      LIMIT 500
    `);

    const links: GraphLink[] = ((linkResult.data ?? []) as RawLinkRow[]).map(
      (row) => ({
        source: row.source,
        target: row.target,
        type: (row.type ?? "RELATED_TO") as RelationshipType,
      }),
    );

    const payload: GraphData = { nodes, links };
    return NextResponse.json(payload);
  } catch (error: unknown) {
    console.error("Graph API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch graph data",
        details:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
