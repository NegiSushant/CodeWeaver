import fs from "fs";
import path from "path";
import { FalkorDB } from "falkordb";
import { execSync } from "child_process";

// Configuration
const GRAPH_NAME = "codeweaver";
const REPO_URL =
  "https://github.com/NegiSushant/Autonomous-Prior-Authorization-Agent.git";
const REPO_DIR = path.join(process.cwd(), "temp-repo");

// Use the cloned repo as project root
const PROJECT_ROOT = REPO_DIR;

const FALKORDB_HOST = process.env.FALKORDB_HOST || "localhost";
const FALKORDB_PORT = Number(process.env.FALKORDB_PORT || 6379);
const FALKORDB_PASSWORD = process.env.FALKORDB_PASSWORD || "yourpassword";

// Final Scope - Files & Folders to Include
const INCLUDE_PATHS = [
  "src/lib/graph",
  "src/lib/tools",
  "src/lib/agents",
  "src/lib/prompts",
  "src/lib/policy-kb",
  "src/lib/interfaces",
  "src/services",
  "src/repository",
  "src/di",
  "src/types",
  "src/components/dashboard",
  "src/app/api",
  "prisma/schema.prisma",
  "README.md",
];

// Manual Enrichment Data
const MODULES = [
  {
    name: "Agent Core",
    description: "LangGraph state machine, nodes, and conditions",
  },
  {
    name: "Agent Tools",
    description: "Tools used by the agent to gather clinical data",
  },
  { name: "Services Layer", description: "Business logic services" },
  { name: "Repository Layer", description: "Data access layer" },
  { name: "API Layer", description: "Next.js API routes" },
  {
    name: "Dashboard UI",
    description: "Medical Director investigation and review interface",
  },
  {
    name: "Policy Knowledge Base",
    description: "Insurance policy documents for RAG",
  },
  {
    name: "Dependency Injection",
    description: "DI container for repositories and services",
  },
  {
    name: "Types & Interfaces",
    description: "Shared types, DTOs and contracts",
  },
];

const FEATURES = [
  {
    name: "Prior Authorization Flow",
    description: "End-to-end autonomous prior authorization investigation",
  },
  {
    name: "ReAct Agent Loop",
    description: "Reason → Act → Reflect cycle using LangGraph",
  },
  {
    name: "Human-in-the-Loop",
    description: "Pauses agent execution for Medical Director review",
  },
  {
    name: "Clinical Evidence Gathering",
    description: "Collects evidence from EHR, imaging and pharmacy records",
  },
  {
    name: "Policy RAG",
    description: "Retrieves and applies insurance policy criteria",
  },
  {
    name: "Clean Architecture",
    description: "Services, Repositories and Dependency Injection separation",
  },
];

const PERSON = {
  name: "Sushant Singh Negi",
  role: "Creator & Owner",
};

// Manual high-value relationships
const MANUAL_RELATIONSHIPS = [
  // Features
  {
    fromPath: "src/lib/graph/graph.ts",
    toName: "ReAct Agent Loop",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/lib/graph/nodes/reasoner.ts",
    toName: "ReAct Agent Loop",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/lib/graph/nodes/tool-executor.ts",
    toName: "Clinical Evidence Gathering",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/lib/graph/nodes/reflect.ts",
    toName: "ReAct Agent Loop",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/lib/tools/EHRNotes.ts",
    toName: "Clinical Evidence Gathering",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/lib/tools/ImagingHistory.ts",
    toName: "Clinical Evidence Gathering",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/lib/tools/PharmacyRecords.ts",
    toName: "Clinical Evidence Gathering",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/components/dashboard/InvestigationRunner.tsx",
    toName: "Human-in-the-Loop",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/components/dashboard/ExecutionTrace.tsx",
    toName: "Human-in-the-Loop",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/components/dashboard/EvidencePanel.tsx",
    toName: "Clinical Evidence Gathering",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },
  {
    fromPath: "src/lib/policy-kb",
    toName: "Policy RAG",
    type: "IMPLEMENTS",
    toLabel: "Feature",
  },

  // Important architectural links
  {
    fromPath: "src/services/PriorAuthServices.ts",
    toName: "Repository Layer",
    type: "USES",
    toLabel: "Module",
  },
  {
    fromPath: "src/lib/graph/nodes/tool-executor.ts",
    toName: "Agent Tools",
    type: "USES",
    toLabel: "Module",
  },
];

// Helper Functions
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(ts|tsx|js|jsx|prisma|md|txt)$/.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function getModuleForFile(relativePath: string): string {
  if (relativePath.includes("src/lib/graph")) return "Agent Core";
  if (relativePath.includes("src/lib/tools")) return "Agent Tools";
  if (relativePath.includes("src/services")) return "Services Layer";
  if (relativePath.includes("src/repository")) return "Repository Layer";
  if (relativePath.includes("src/app/api")) return "API Layer";
  if (relativePath.includes("src/components/dashboard")) return "Dashboard UI";
  if (relativePath.includes("src/lib/policy-kb"))
    return "Policy Knowledge Base";
  if (relativePath.includes("src/di")) return "Dependency Injection";
  if (
    relativePath.includes("src/lib/interfaces") ||
    relativePath.includes("src/types")
  )
    return "Types & Interfaces";
  if (
    relativePath.includes("src/lib/agents") ||
    relativePath.includes("src/lib/prompts")
  )
    return "Agent Core";
  return "Shared";
}

function extractExports(content: string): {
  functions: string[];
  classes: string[];
} {
  const functions: string[] = [];
  const classes: string[] = [];

  // Simple regex-based extraction
  const funcMatches = content.matchAll(
    /(?:export\s+(?:async\s+)?function\s+(\w+)|export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\()/g,
  );
  for (const match of funcMatches) {
    const name = match[1] || match[2];
    if (name) functions.push(name);
  }

  const classMatches = content.matchAll(
    /export\s+(?:default\s+)?(?:class|interface|type)\s+(\w+)/g,
  );
  for (const match of classMatches) {
    if (match[1]) classes.push(match[1]);
  }

  return { functions, classes };
}

function cloneRepo() {
  console.log("Cloning repository...");

  // Remove old temp folder if exists
  if (fs.existsSync(REPO_DIR)) {
    fs.rmSync(REPO_DIR, { recursive: true, force: true });
  }

  execSync(`git clone --depth 1 ${REPO_URL} ${REPO_DIR}`, {
    stdio: "inherit",
  });

  console.log("Repository cloned successfully.\n");
}

function cleanupRepo() {
  if (!fs.existsSync(REPO_DIR)) return;

  console.log("\nCleaning up temporary repository...");

  try {
    fs.rmSync(REPO_DIR, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 500,
    });
    console.log("Temporary repository deleted successfully.");
  } catch {
    console.warn(
      "Could not fully delete temp-repo (file locked). Trying alternative method...",
    );

    const trashDir = path.join(process.cwd(), `temp-repo-trash-${Date.now()}`);

    try {
      fs.renameSync(REPO_DIR, trashDir);
      console.log(
        "Temporary repository moved to trash folder. You can delete it manually later.",
      );

      // Try deleting the renamed folder in background
      setTimeout(() => {
        try {
          fs.rmSync(trashDir, { recursive: true, force: true });
        } catch {
          // Ignore - user can delete manually
        }
      }, 2000);
    } catch {
      console.warn(
        "Cleanup failed. Please delete the 'temp-repo' folder manually.",
      );
    }
  }
}

// Main Ingestion Logic
async function main() {
  console.log("Starting Ingestion...\n");

  // Clone the repo first
  cloneRepo();

  console.log("PROJECT_ROOT =", PROJECT_ROOT);
  console.log("Does PROJECT_ROOT exist?", fs.existsSync(PROJECT_ROOT));
  console.log(
    "Contents of PROJECT_ROOT:",
    fs.existsSync(PROJECT_ROOT) ? fs.readdirSync(PROJECT_ROOT) : "NOT FOUND",
  );

  const client = await FalkorDB.connect({
    host: FALKORDB_HOST,
    port: FALKORDB_PORT,
    password: FALKORDB_PASSWORD,
  });

  const graph = client.selectGraph(GRAPH_NAME);

  // Clear existing graph
  console.log("Clearing existing graph...");
  await graph.query("MATCH (n) DETACH DELETE n");

  // 1. Create Person
  console.log("Creating Person node...");
  await graph.query(`CREATE (p:Person {name: $name, role: $role})`, {
    params: PERSON,
  });

  // 2. Create Modules
  console.log("Creating Module nodes...");
  for (const mod of MODULES) {
    await graph.query(
      `CREATE (m:Module {name: $name, description: $description})`,
      { params: mod },
    );
  }

  // 3. Create Features
  console.log("🎯 Creating Feature nodes...");
  for (const feature of FEATURES) {
    await graph.query(
      `CREATE (f:Feature {name: $name, description: $description})`,
      { params: feature },
    );
  }

  // 4. Process Files
  console.log("Processing files...");
  let fileCount = 0;

  for (const includePath of INCLUDE_PATHS) {
    const fullPath = path.join(PROJECT_ROOT, includePath);

    let files: string[] = [];
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      files = [fullPath];
    } else {
      files = getAllFiles(fullPath);
    }

    for (const filePath of files) {
      const relativePath = path
        .relative(PROJECT_ROOT, filePath)
        .replace(/\\/g, "/");
      const fileName = path.basename(filePath);
      const content = fs.readFileSync(filePath, "utf-8");
      const moduleName = getModuleForFile(relativePath);
      const { functions, classes } = extractExports(content);

      // Create File node
      await graph.query(
        `
        CREATE (f:File {
          name: $name,
          path: $path,
          language: $language,
          description: $description
        })
        WITH f
        MATCH (m:Module {name: $moduleName})
        CREATE (f)-[:BELONGS_TO]->(m)
        WITH f
        MATCH (p:Person {name: $personName})
        CREATE (f)-[:OWNED_BY]->(p)
        `,
        {
          params: {
            name: fileName,
            path: relativePath,
            language:
              fileName.endsWith(".ts") || fileName.endsWith(".tsx")
                ? "TypeScript"
                : "Other",
            description: `Source file: ${relativePath}`,
            moduleName,
            personName: PERSON.name,
          },
        },
      );

      // Create Function nodes
      for (const funcName of functions) {
        await graph.query(
          `
          MATCH (file:File {path: $path})
          CREATE (fn:Function {name: $name, description: $description})
          CREATE (fn)-[:BELONGS_TO]->(file)
          `,
          {
            params: {
              path: relativePath,
              name: funcName,
              description: `Function in ${fileName}`,
            },
          },
        );
      }

      // Create Class nodes
      for (const className of classes) {
        await graph.query(
          `
          MATCH (file:File {path: $path})
          CREATE (c:Class {name: $name, description: $description})
          CREATE (c)-[:BELONGS_TO]->(file)
          `,
          {
            params: {
              path: relativePath,
              name: className,
              description: `Class/Interface in ${fileName}`,
            },
          },
        );
      }

      fileCount++;
    }
  }

  console.log(`Created ${fileCount} File nodes`);

  // 5. Apply Manual Relationships
  console.log("Applying manual relationships...");
  for (const rel of MANUAL_RELATIONSHIPS) {
    try {
      if (rel.toLabel === "Feature") {
        await graph.query(
          `
          MATCH (a:File) WHERE a.path CONTAINS $fromPath
          MATCH (b:Feature {name: $toName})
          CREATE (a)-[:${rel.type}]->(b)
          `,
          { params: { fromPath: rel.fromPath, toName: rel.toName } },
        );
      } else if (rel.toLabel === "Module") {
        await graph.query(
          `
          MATCH (a:File) WHERE a.path CONTAINS $fromPath
          MATCH (b:Module {name: $toName})
          CREATE (a)-[:${rel.type}]->(b)
          `,
          { params: { fromPath: rel.fromPath, toName: rel.toName } },
        );
      }
    } catch {
      console.warn(`Could not create relationship for ${rel.fromPath}`);
    }
  }

  // 6. Final Stats
  const stats = await graph.query(`
    MATCH (n)
    RETURN labels(n)[0] as label, count(*) as count
    ORDER BY count DESC
  `);

  console.log("\nGraph Statistics:");
  console.table(stats.data);

  console.log("\nIngestion completed successfully!");

  // Delete the temporary cloned repository
  cleanupRepo();

  await client.close();
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
