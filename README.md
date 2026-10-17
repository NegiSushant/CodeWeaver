# 🕸️ CodeWeaver

> **Graph-Powered Codebase Intelligence Agent built on FalkorDB**  
> *Understand code architecture, impact analysis, and reasoning paths beyond vector search.*

[![FalkorDB](https://img.shields.io/badge/Graph_Database-FalkorDB-emerald.svg)](https://falkordb.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black.svg)](https://nextjs.org/)
[![LangChain](https://img.shields.io/badge/Agent-LangChain_&_LangGraph-blue.svg)](https://langchain.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_Postgres-indigo.svg)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Problem Statement

Traditional AI coding assistants rely on **vector search (vanilla RAG)** to retrieve codebase context. While vector search is effective at retrieving isolated snippets of text, it completely breaks down when applied to complex software systems:

1. **No Structural Awareness**: Vector chunks lose the abstract syntax tree (AST), class hierarchies, caller-callee chains, and module boundaries.
2. **Inability to Trace Multi-Hop Dependencies**: Answering *"What breaks if I change this repository service?"* requires traversing multiple hops (`Repository` ➔ `Service` ➔ `Agent Node` ➔ `API Route`), which vector embeddings simply cannot compute.
3. **Black-Box Hallucinations**: LLMs guess architectural boundaries without verifiable grounding, leading to inaccurate answers and zero transparency into why an answer was reached.
4. **Architectural Drift**: Developers join teams or inherit large codebases with no clear mental model of how components connect, who owns what, or how high-level business features map to low-level source files.

---

## 💡 Solution

**CodeWeaver** turns an entire repository into a living, queryable **knowledge graph** stored in **FalkorDB**. 

Instead of guessing from disconnected text chunks, an autonomous **ReAct AI Agent** dynamically queries FalkorDB via Cypher to analyze call graphs, module boundaries, blast radiuses, and ownership.

Every answer returned by CodeWeaver is **100% explainable**:
- **Reasoning Path**: Assistant responses include an interactive subgraph modal showing the exact entities (Modules, Files, Functions, Classes, Features) traversed in FalkorDB to formulate the answer.
- **Dedicated Knowledge Graph Page**: An interactive visual canvas allowing engineers to search, explore, zoom, and inspect every node and relationship in the codebase.
- **Grok-Style Chat Sessions**: Persistent, isolated multi-session conversations backed by PostgreSQL and Prisma.

---

## 🎬 Demo

- **Video Demo**: `[Demo Video Link]`(https://youtu.be/0gjnDK7I5U8)
- **Dev Article**: `[Dev Post Link]`(https://dev.to/devnegi/codeweaver-giving-ai-agents-real-context-with-a-codebase-knowledge-graph-252j)

---

## 🏆 Hackathon Tracks

CodeWeaver is built specifically for the **FalkorDB Graph Hacks** hackathon:

- **Primary Track: Agents That Act on Connected Data**  
  The core of CodeWeaver is a LangChain ReAct agent whose entire reasoning loop is powered by querying and traversing connected data in FalkorDB. The agent doesn't guess; it actively plans, queries the graph for structural truth, and reflects on multi-hop relationships.
- **Secondary Track: Company Brain**  
  CodeWeaver serves as the institutional memory and architectural brain of the engineering organization, preserving knowledge of component dependencies, business feature implementations, and domain owners.

---

## ✨ Key Features

- **Autonomous Graph Agent**: Powered by LangChain and LangGraph with dedicated tools to execute Cypher queries on FalkorDB.
- **Interactive Reasoning Path**: Click the **Reasoning Path** icon on any agent answer to inspect the exact subgraph of traversed entities and relationships.
- **Multi-Hop Impact Analysis**: Identifies downstream blast radius when modifying files, interfaces, or functions across up to 3 hops.
- **Feature-to-Code Mapping**: Maps high-level product features (e.g. *ReAct Agent Loop*, *Human-in-the-Loop*, *Policy RAG*) directly to their implementing source files and classes.
- **Ownership & Team Knowledge**: Query component maintainers, authors, and module owners.
- **Full Knowledge Graph Explorer (`/graph`)**:
  - Interactive force-directed canvas (`react-force-graph-2d`).
  - Real-time node search with auto-focus and zoom.
  - Interactive category filters (`Module`, `Feature`, `File`, `Function`, `Class`, `Person`).
  - Node inspector card showing properties, paths, and connected incoming/outgoing relationships.
- **Grok-Style History Sidebar**: Multi-session persistent chat with instant session switching, new chat creation, and deletion.
- **Sample Questions for Instant Exploration**: Quick-start prompt cards on new chats for effortless discovery.
- **Soft Sage Design System**: Minimal, modern interface inspired by *"before i call."* with first-class Light and Dark mode support.

---

## 🗺️ Graph Data Model

CodeWeaver extracts the repository structure into a high-fidelity property graph in **FalkorDB**:

```
(Person)-[:OWNED_BY]-(File|Module)
(File)-[:BELONGS_TO]->(Module)
(File)-[:IMPLEMENTS]->(Feature)
(Function|Class)-[:BELONGS_TO]->(File)
(Function)-[:CALLS]->(Function)
(Class|File)-[:USES]->(Class|File)
```

### Node Labels

| Label | Description | Example Properties |
| :--- | :--- | :--- |
| **`Module`** | High-level architectural domain layer | `name: "Agent Core"`, `description: "LangGraph state machine"` |
| **`Feature`** | Business or functional capability | `name: "ReAct Agent Loop"`, `description: "Reason-Act-Reflect cycle"` |
| **`File`** | Source code file in the repository | `name: "graph.ts"`, `path: "src/lib/graph/graph.ts"` |
| **`Function`** | Exported function or method | `name: "createAgent"`, `path: "src/lib/agents/reactAgent.ts"` |
| **`Class`** | TypeScript/JavaScript class or entity | `name: "PriorAuthServices"`, `path: "src/services/PriorAuthServices.ts"` |
| **`Person`** | Codebase author, owner, or maintainer | `name: "Sushant Singh Negi"`, `role: "Creator & Owner"` |

### Relationship Types

| Relationship | Source Node | Target Node | Semantics |
| :--- | :--- | :--- | :--- |
| **`BELONGS_TO`** | `File` / `Function` / `Class` | `Module` / `File` | Structural encapsulation & hierarchy |
| **`IMPLEMENTS`** | `File` / `Function` / `Class` | `Feature` | Connects source code to product capabilities |
| **`CALLS`** | `Function` | `Function` | AST function invocation call graph |
| **`USES`** | `File` / `Class` | `Class` / `File` | Dependency and instantiation relationship |
| **`OWNED_BY`** | `File` / `Module` | `Person` | Code ownership & accountability |

---

## 🚀 How FalkorDB is Used

FalkorDB is not an afterthought or an auxiliary cache in CodeWeaver—**it is the primary source of truth and intelligence.**

```mermaid
flowchart LR
    A[User Prompt] --> B[Next.js App]
    B --> C[LangChain ReAct Agent]
    C -->|Cypher Query Tools| D[(FalkorDB Graph Engine)]
    D -->|Nodes, IDs, Paths| C
    C -->|Natural Language + Reasoning Node IDs| B
    B -->|Interactive Subgraph| E[Reasoning Path Modal]
    B -->|Full Visualization| F[Knowledge Graph Canvas]
```

### Why FalkorDB?
1. **Low-Latency In-Memory Graph Processing**: FalkorDB’s Redis-based C architecture allows the ReAct agent to execute multi-hop Cypher queries in single-digit milliseconds during its chain-of-thought loop.
2. **Expressive OpenCypher Engine**: Allows the agent to query path patterns (`MATCH p = (n)-[:CALLS*1..3]->(m)`) that cannot be modeled in relational or vector databases.
3. **Graph ID Grounding**: Every node query returns FalkorDB internal node IDs (`ID(n)`). These IDs are passed to the frontend to render the exact subgraph traversed by the agent.

---

## 🏗️ Architecture Overview

CodeWeaver is built with a modular, layered clean architecture:

- **Presentation Layer**: Next.js 16 App Router, React 19, Tailwind CSS v4, `lucide-react`, and `react-force-graph-2d`.
- **Agent Orchestration**: LangChain & LangGraph executing a ReAct loop with customized Cypher tools.
- **Graph Layer**: FalkorDB client (`falkordb` npm package) connecting via Redis protocol to the `codeweaver` graph instance.
- **Persistence Layer**: PostgreSQL database managed via Prisma ORM for chat sessions, messages, and reasoning node history.
- **Ingestion Engine**: AST parser (`scripts/ingest-codebase.ts`) that scans TypeScript files, extracts imports, calls, classes, and features, and constructs graph topologies in FalkorDB.

---

## 🛠️ Tech Stack

- **Graph Database**: [FalkorDB](https://falkordb.com/)
- **Relational Database**: PostgreSQL 16
- **Full-Stack Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **AI & Agent Framework**: [LangChain](https://js.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraphjs/)
- **LLM Provider**: Azure OpenAI / OpenAI (GPT-4o / GPT-4o-mini)
- **ORM**: [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg`
- **Graph Visualization**: `react-force-graph-2d`
- **Styling**: Tailwind CSS v4, Vanilla CSS design tokens (Soft Sage palette)
- **Runtime & Package Manager**: [Bun](https://bun.sh/) (or Node.js 20+)
- **Containerization**: Docker & Docker Compose

---

## 💻 Setup Instructions

### 1. Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose installed and running.
- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) v20+.
- An OpenAI or Azure OpenAI API Key.

### 2. Clone the Repository
```bash
git clone https://github.com/[Your-GitHub-Username]/CodeWeaver.git
cd CodeWeaver
```

### 3. Configure Environment Variables
Copy `.example.env` or create `.env`:
```env
# PostgreSQL
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"

# FalkorDB
FALKORDB_HOST="localhost"
FALKORDB_PORT=6379
FALKORDB_PASSWORD="yourpassword"

# LLM Configuration (Azure OpenAI)
OPENAI_API_KEY=""
OPENAI_ENDPOINT="https://azure.openai.azure.com"
OPENAI_API_VERSION=""
OPENAI_DEPLOYEMENTNAME="gpt-4o"
OPENAI_MODEL="gpt-4o"

# NextAuth
NEXTAUTH_SECRET="super-secret-key-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3001"
```

### 4. Start Infrastructure with Docker
Spin up both **FalkorDB** and **PostgreSQL** with a single command:
```bash
docker compose up -d
```

Verify that the containers are healthy:
```bash
docker compose ps
```

### 5. Install Dependencies & Push Database Schema
```bash
bun install
bunx --bun prisma migrate dev
bunx --bun prisma generate
```

### 6. Run the Codebase Ingestion into FalkorDB
Ingest the codebase AST, architectural modules, and features into FalkorDB:
```bash
bun run ingest
```
*(You will see output confirming 200+ nodes and 300+ relationships inserted into the `codeweaver` graph).*

### 7. Start the Development Server
```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📥 Ingestion Process

The ingestion pipeline located at [`scripts/ingest-codebase.ts`](scripts/ingest-codebase.ts) automates code understanding:

1. **AST & File Traversal**:
   - Recursively parses source files (`.ts`, `.tsx`, `.prisma`).
   - Identifies declared classes, methods, exported functions, and dependencies.
2. **Relationship Synthesis**:
   - Matches internal imports to create `USES` and `CALLS` relationships.
   - Assigns files to architectural layers (`BELONGS_TO` ➔ `Module`).
3. **Domain Enrichment**:
   - Connects critical files to high-level system features (`IMPLEMENTS` ➔ `Feature`).
   - Maps module maintainers (`OWNED_BY` ➔ `Person`).
4. **Batch Cypher Ingestion**:
   - Uses transactional Cypher commands (`MERGE`, `CREATE`) to index nodes and edges into FalkorDB.

---

## 💬 Example Questions to Try

Try asking the CodeWeaver Agent these questions in the Playground:

| Question | Capability Tested |
| :--- | :--- |
| **"What is the overall architecture of this project?"** | Traverses high-level `Module` nodes and connected files |
| **"Explain the ReAct Agent Loop feature"** | Finds files and classes connected via `IMPLEMENTS` to the feature |
| **"Which files implement Human-in-the-Loop?"** | Multi-hop traversal between features and code entities |
| **"What depends on EHRNotes.ts?"** | Blast radius & impact analysis via `CALLS` and `USES` |
| **"Who owns the Prior Authorization Flow?"** | Resolves domain responsibility via `OWNED_BY` |

---

## 🔍 Important Cypher Queries Used by the Agent

Below are core Cypher queries executed dynamically by CodeWeaver's tools:

### 1. High-Level Architecture Overview
```cypher
MATCH (m:Module)
OPTIONAL MATCH (f:File)-[:BELONGS_TO]->(m)
RETURN
  ID(m)                AS m_id,
  m.name               AS module,
  m.description        AS description,
  count(f)             AS file_count,
  collect(ID(f))[0..3] AS file_ids
ORDER BY file_count DESC
```

### 2. Multi-Hop Impact & Dependency Analysis
```cypher
MATCH (n)
WHERE n.name CONTAINS $name OR n.path CONTAINS $name
OPTIONAL MATCH (n)<-[:BELONGS_TO|CALLS|USES*1..2]-(dependent)
RETURN DISTINCT
  ID(n)                           AS n_id,
  ID(dependent)                   AS dep_id,
  labels(n)[0]                    AS type,
  n.name                          AS name,
  n.path                          AS path,
  collect(DISTINCT dependent.name) AS impacted_by
LIMIT 15
```

### 3. Feature-to-Implementation Mapping
```cypher
MATCH (n)-[:IMPLEMENTS]->(f:Feature)
WHERE f.name CONTAINS $featureName
RETURN
  ID(n)         AS n_id,
  ID(f)         AS f_id,
  f.name        AS feature,
  f.description AS description,
  labels(n)[0]  AS type,
  n.name        AS name,
  n.path        AS path
```

### 4. Ownership & Maintainer Resolution
```cypher
MATCH (n)-[:OWNED_BY]->(p:Person)
WHERE n.name CONTAINS $name OR n.path CONTAINS $name
RETURN
  ID(n)   AS n_id,
  ID(p)   AS p_id,
  n.name  AS item,
  n.path  AS path,
  p.name  AS owner,
  p.role  AS role
```

---

## 🤖 AI Tools Disclosure

In accordance with hackathon rules and transparency best practices:
- **Language Models**: Azure OpenAI / OpenAI GPT-4o models were used for agent reasoning and tool invocation.
- **Agent Framework**: LangChain and LangGraph were used to structure the ReAct loop.
- **Development Assistance**: AI coding assistants (including Google Antigravity) were used during the hackathon primarily for UI refinement and for implementing the graph visualization components and utilities.
- **Core Architecture & Cypher Design**: All graph schema designs, Cypher queries, FalkorDB integration logic, and reasoning path algorithms were custom-built for this submission.

---

## 👥 Team

- **Sushant Singh Negi** — Full-Stack & AI Engineer
  - GitHub: [@NegiSushant](https://github.com/NegiSushant)
  - Project: [CodeWeaver](https://github.com/NegiSushant/CodeWeaver)

---

## 📄 License

This project has no LICENSE yet.
