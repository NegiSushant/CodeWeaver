import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getCodeGraph } from "@/lib/falkordb";

//General Graph Query
export const queryGraphTool = tool(
  async ({ cypher }) => {
    const graph = await getCodeGraph();
    const result = await graph.query(cypher);
    return JSON.stringify(result.data, null, 2);
  },
  {
    name: "query_graph",
    description: `Execute a Cypher query on the codebase knowledge graph. 
    Use this for complex questions about structure, relationships, and architecture.
    Available node labels: File, Function, Class, Module, Feature, Person
    Available relationships: BELONGS_TO, CALLS, USES, IMPLEMENTS, OWNED_BY, RELATED_TO`,
    schema: z.object({
      cypher: z.string().describe("The Cypher query to execute"),
    }),
  },
);

//Find Impact of a File/Function
export const findImpactTool = tool(
  async ({ name }) => {
    const graph = await getCodeGraph();
    const result = await graph.query(
      `
      MATCH (n)
      WHERE n.name CONTAINS $name OR n.path CONTAINS $name
      OPTIONAL MATCH (n)<-[:BELONGS_TO|CALLS|USES*1..2]-(dependent)
      RETURN DISTINCT 
        labels(n)[0] as type,
        n.name as name,
        n.path as path,
        collect(DISTINCT dependent.name) as impacted_by
      LIMIT 15
      `,
      { params: { name } },
    );
    return JSON.stringify(result.data, null, 2);
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

//Find Owners / Experts
export const findOwnersTool = tool(
  async ({ name }) => {
    const graph = await getCodeGraph();
    const result = await graph.query(
      `
      MATCH (n)-[:OWNED_BY]->(p:Person)
      WHERE n.name CONTAINS $name OR n.path CONTAINS $name
      RETURN n.name as item, n.path as path, p.name as owner, p.role as role
      `,
      { params: { name } },
    );
    return JSON.stringify(result.data, null, 2);
  },
  {
    name: "find_owners",
    description: "Find who owns or is responsible for a file or module",
    schema: z.object({
      name: z.string().describe("Name of file, module or component"),
    }),
  },
);

//Explain Feature Implementation
export const explainFeatureTool = tool(
  async ({ featureName }) => {
    const graph = await getCodeGraph();
    const result = await graph.query(
      `
      MATCH (n)-[:IMPLEMENTS]->(f:Feature)
      WHERE f.name CONTAINS $featureName
      RETURN f.name as feature, f.description as description,
             labels(n)[0] as type, n.name as name, n.path as path
      `,
      { params: { featureName } },
    );
    return JSON.stringify(result.data, null, 2);
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

//Get Architecture Overview
export const getArchitectureTool = tool(
  async () => {
    const graph = await getCodeGraph();
    const result = await graph.query(`
      MATCH (m:Module)
      OPTIONAL MATCH (f:File)-[:BELONGS_TO]->(m)
      RETURN m.name as module, m.description as description, count(f) as file_count
      ORDER BY file_count DESC
    `);
    return JSON.stringify(result.data, null, 2);
  },
  {
    name: "get_architecture",
    description:
      "Get a high-level overview of the project architecture and modules",
    schema: z.object({}),
  },
);

// Export all tools
export const graphTools = [
  queryGraphTool,
  findImpactTool,
  findOwnersTool,
  explainFeatureTool,
  getArchitectureTool,
];
