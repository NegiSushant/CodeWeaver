import { FalkorDB } from "falkordb";

const globalForFalkor = globalThis as unknown as {
  falkorClient: FalkorDB | undefined;
};

export async function getFalkorClient(): Promise<FalkorDB> {
  if (globalForFalkor.falkorClient) {
    return globalForFalkor.falkorClient;
  }

  const host = process.env.FALKORDB_HOST;
  const port = Number(process.env.FALKORDB_PORT);
  const password = process.env.FALKORDB_PASSWORD;

  const client = await FalkorDB.connect({
    host,
    port,
    password,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForFalkor.falkorClient = client;
  }

  return client;
}

// Helper to get the main graph
export async function getCodeGraph() {
  const client = await getFalkorClient();
  return client.selectGraph("codeweaver");
}
