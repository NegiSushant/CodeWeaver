import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getCodeGraph } from "@/lib/falkordb";
import type { ToolResult } from "@/types/graph";

/**
 * Extract unique numeric node IDs from a raw FalkorDB result set.
 * Each row may carry one or more `_id` columns produced by `ID(node)` calls
 * in the Cypher query. We collect every numeric value found under those keys.
 */
function extractNodeIds(rows: Record<string, unknown>[]): number[] {
  const ids = new Set<number>();
  for (const row of rows) {
    for (const [key, val] of Object.entries(row)) {
      if (
        (key.endsWith("_id") || key === "id" || key === "nodeId") &&
        typeof val === "number"
      ) {
        ids.add(val);
      } else if (
        (key.endsWith("_ids") || key === "nodeIds") &&
        Array.isArray(val)
      ) {
        for (const item of val) {
          if (typeof item === "number") ids.add(item);
        }
      } else if (
        val !== null &&
        typeof val === "object" &&
        "id" in val &&
        typeof (val as { id: unknown }).id === "number"
      ) {
        ids.add((val as { id: number }).id);
      }
    }
  }
  return [...ids];
}

//General Graph Query Tool
export const queryGraphTool = tool(
  async ({ cypher }): Promise<string> => {
    const graph = await getCodeGraph();
    const result = await graph.query(cypher);
    const rows = (result.data ?? []) as Record<string, unknown>[];
    const nodeIds = extractNodeIds(rows);
    // If the query returned node objects themselves (not plain values), attempt to pull .id off them as a fallback.
    if (nodeIds.length === 0) {
      for (const row of rows) {
        for (const val of Object.values(row)) {
          if (
            val !== null &&
            typeof val === "object" &&
            "id" in val &&
            typeof (val as { id: unknown }).id === "number"
          ) {
            nodeIds.push((val as { id: number }).id);
          }
        }
      }
    }
    const payload: ToolResult = { data: rows, nodeIds };
    return JSON.stringify(payload, null, 2);
  },
  {
    name: "query_graph",
    description: `Execute a Cypher query on the codebase knowledge graph.
    Use this for complex questions about structure, relationships, and architecture.
    Available node labels: File, Function, Class, Module, Feature, Person
    Available relationships: BELONGS_TO, CALLS, USES, IMPLEMENTS, OWNED_BY, RELATED_TO
    To capture node IDs in your query, include ID(n) AS n_id in the RETURN clause.`,
    schema: z.object({
      cypher: z.string().describe("The Cypher query to execute"),
    }),
  },
);

//Find Impact of a File/Function Tool
export const findImpactTool = tool(
  async ({ name }): Promise<string> => {
    const graph = await getCodeGraph();
    const result = await graph.query(
      `
      MATCH (n)
      WHERE n.name CONTAINS $name OR n.path CONTAINS $name
      OPTIONAL MATCH (n)<-[:BELONGS_TO|CALLS|USES*1..2]-(dependent)
       RETURN DISTINCT
        ID(n) AS n_id, labels(n)[0] AS type, n.name AS name, n.path AS path, collect(DISTINCT ID(dependent)) AS dep_ids, collect(DISTINCT dependent.name) AS impacted_by
      LIMIT 15
      `,
      { params: { name } },
    );
    const rows = (result.data ?? []) as Record<string, unknown>[];
    const nodeIds = extractNodeIds(rows);
    const payload: ToolResult = { data: rows, nodeIds };
    return JSON.stringify(payload, null, 2);
  },
  {
    name: "find_impact",
    description:
      "Find what depends on a file, function, or class. Useful for impact analysis.",
    schema: z.object({
      name: z.string().describe("Name or path of the file/function/class"),
    }),
  },
);

//Find Owners / Experts Tool
export const findOwnersTool = tool(
  async ({ name }): Promise<string> => {
    const graph = await getCodeGraph();
    const result = await graph.query(
      `
      MATCH (n)-[:OWNED_BY]->(p:Person)
      WHERE n.name CONTAINS $name OR n.path CONTAINS $name
      RETURN
        ID(n) AS n_id, ID(p) AS p_id, n.name AS item, n.path AS path, p.name AS owner, p.role AS role
      `,
      { params: { name } },
    );
    const rows = (result.data ?? []) as Record<string, unknown>[];
    const nodeIds = extractNodeIds(rows);
    const payload: ToolResult = { data: rows, nodeIds };
    return JSON.stringify(payload, null, 2);
  },
  {
    name: "find_owners",
    description: "Find who owns or is responsible for a file or module",
    schema: z.object({
      name: z.string().describe("Name of file, module or component"),
    }),
  },
);

//Explain Feature Implementation Tool
export const explainFeatureTool = tool(
  async ({ featureName }): Promise<string> => {
    const graph = await getCodeGraph();
    const result = await graph.query(
      `
      MATCH (n)-[:IMPLEMENTS]->(f:Feature)
      WHERE f.name CONTAINS $featureName
      RETURN
        ID(n) AS n_id, ID(f) AS f_id, f.name AS feature, f.description AS description, labels(n)[0] AS type, n.name AS name, n.path AS path
      `,
      { params: { featureName } },
    );
    const rows = (result.data ?? []) as Record<string, unknown>[];
    const nodeIds = extractNodeIds(rows);
    const payload: ToolResult = { data: rows, nodeIds };
    return JSON.stringify(payload, null, 2);
  },
  {
    name: "explain_feature",
    description: "Show which files and functions implement a specific feature",
    schema: z.object({
      featureName: z
        .string()
        .describe(
          "Name of the feature (e.g. ReAct Agent Loop, Human-in-the-Loop)",
        ),
    }),
  },
);

//Get Architecture Overview Tool
export const getArchitectureTool = tool(
  async (): Promise<string> => {
    const graph = await getCodeGraph();
    const result = await graph.query(`
      MATCH (m:Module)
      OPTIONAL MATCH (f:File)-[:BELONGS_TO]->(m)
      RETURN
        ID(m) AS m_id, m.name AS module, m.description AS description, count(f) AS file_count, collect(ID(f))[0..3] AS file_ids
      ORDER BY file_count DESC
    `);
    const rows = (result.data ?? []) as Record<string, unknown>[];
    const nodeIds = extractNodeIds(rows);
    const payload: ToolResult = { data: rows, nodeIds };
    return JSON.stringify(payload, null, 2);
  },
  {
    name: "get_architecture",
    description:
      "Get a high-level overview of the project architecture and modules",
    schema: z.object({}),
  },
);

export const graphTools = [
  queryGraphTool,
  findImpactTool,
  findOwnersTool,
  explainFeatureTool,
  getArchitectureTool,
];
