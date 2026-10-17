import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  AIMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";

import agent from "@/lib/agents/reactAgent";
import { getCodeGraph } from "@/lib/falkordb";
import prismaClient from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth-helper";

function collectReasoningNodeIds(messages: BaseMessage[]): number[] {
  const ids = new Set<number>();

  const scan = (item: unknown) => {
    if (!item) return;
    if (typeof item === "number") return;
    if (Array.isArray(item)) {
      for (const el of item) scan(el);
      return;
    }
    if (typeof item === "object") {
      for (const [key, val] of Object.entries(item as Record<string, unknown>)) {
        if (
          (key.endsWith("_id") || key === "id" || key === "nodeId") &&
          typeof val === "number"
        ) {
          ids.add(val);
        } else if (
          (key === "nodeIds" || key.endsWith("_ids")) &&
          Array.isArray(val)
        ) {
          for (const el of val) {
            if (typeof el === "number") ids.add(el);
          }
        } else if (typeof val === "object" && val !== null) {
          scan(val);
        }
      }
    }
  };

  for (const msg of messages) {
    if (!(msg instanceof ToolMessage)) continue;

    const raw =
      typeof msg.content === "string"
        ? msg.content
        : Array.isArray(msg.content)
          ? msg.content
              .filter(
                (item): item is { type: "text"; text: string } =>
                  item.type === "text",
              )
              .map((item) => item.text)
              .join("")
          : "";

    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      scan(parsed);
    } catch {
      // Tool message wasn't JSON — skip
    }
  }

  return [...ids];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], sessionId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const userId = await getAuthenticatedUserId();

    // Session Management: Find or create a session
    let activeSessionId: string | null = null;

    if (userId) {
      if (sessionId && typeof sessionId === "string") {
        const existingSession = await prismaClient.chatSession.findFirst({
          where: { id: sessionId, userId },
        });
        if (existingSession) {
          activeSessionId = existingSession.id;
        }
      }

      if (!activeSessionId) {
        const trimmed = message.trim();
        const title =
          trimmed.slice(0, 45) + (trimmed.length > 45 ? "..." : "");
        const newSession = await prismaClient.chatSession.create({
          data: {
            userId,
            title: title || "New Chat",
          },
        });
        activeSessionId = newSession.id;
      }

      // Persist the incoming user message
      await prismaClient.chatMessage.create({
        data: {
          sessionId: activeSessionId,
          role: "user",
          content: message,
        },
      });
    }

    // Convert frontend chat history into LangChain messages.
    const historyMessages: BaseMessage[] = history.map(
      (msg: { role: string; content: string }) => {
        if (msg.role === "user") return new HumanMessage(msg.content);
        if (msg.role === "assistant") return new AIMessage(msg.content);
        throw new Error(`Unsupported message role: ${msg.role}`);
      },
    );

    const messages = [...historyMessages, new HumanMessage(message)];

    // Invoke the React agent.
    const result = await agent.invoke({ messages });

    const lastAIMessage = [...result.messages]
      .reverse()
      .find((msg) => AIMessage.isInstance(msg));

    const reply =
      typeof lastAIMessage?.content === "string"
        ? lastAIMessage.content
        : Array.isArray(lastAIMessage?.content)
          ? lastAIMessage.content
              .filter(
                (item): item is { type: "text"; text: string } =>
                  item.type === "text",
              )
              .map((item) => item.text)
              .join("\n")
          : "I couldn't generate a response.";

    let reasoningNodeIds = collectReasoningNodeIds(result.messages);

    // If no node IDs were extracted directly from tool calls,
    // match nodes mentioned by name in the assistant reply or user query.
    if (reasoningNodeIds.length === 0) {
      try {
        const graph = await getCodeGraph();
        const textToSearch = `${message}\n${reply}`;
        const matchResult = await graph.query(
          `
          MATCH (n)
          WHERE (n:Module OR n:Feature OR n:File OR n:Class OR n:Function)
            AND n.name IS NOT NULL
            AND size(n.name) >= 3
            AND toLower($textToSearch) CONTAINS toLower(n.name)
          OPTIONAL MATCH (n)-[:BELONGS_TO|IMPLEMENTS|CALLS|USES]-(connected)
          RETURN
            ID(n) AS id,
            collect(ID(connected))[0..2] AS connected_ids
          LIMIT 20
          `,
          { params: { textToSearch } },
        );

        const rows = (matchResult.data ?? []) as {
          id: number;
          connected_ids?: number[];
        }[];
        const matchedSet = new Set<number>();
        for (const r of rows) {
          if (typeof r.id === "number") matchedSet.add(r.id);
          if (Array.isArray(r.connected_ids)) {
            for (const cid of r.connected_ids) {
              if (typeof cid === "number") matchedSet.add(cid);
            }
          }
        }
        if (matchedSet.size > 0) {
          reasoningNodeIds = [...matchedSet];
        }
      } catch (err) {
        console.warn("Reasoning node fallback search error:", err);
      }
    }

    // Persist the assistant message
    if (activeSessionId) {
      await prismaClient.chatMessage.create({
        data: {
          sessionId: activeSessionId,
          role: "assistant",
          content: reply,
          reasoningNodeIds,
        },
      });

      await prismaClient.chatSession.update({
        where: { id: activeSessionId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({
      reply,
      reasoningNodeIds,
      sessionId: activeSessionId,
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to process request",
        details:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
