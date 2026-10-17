import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  AIMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";

import agent from "@/lib/agents/reactAgent";
import type { ToolResult } from "@/types/graph";


function collectReasoningNodeIds(messages: BaseMessage[]): number[] {
  const ids = new Set<number>();

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
      const parsed = JSON.parse(raw) as Partial<ToolResult>;
      if (Array.isArray(parsed.nodeIds)) {
        for (const id of parsed.nodeIds) {
          if (typeof id === "number") ids.add(id);
        }
      }
    } catch {
      // Tool message wasn't a ToolResult — skip silently
    }
  }

  return [...ids];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
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

    const reasoningNodeIds = collectReasoningNodeIds(result.messages);

    return NextResponse.json({ reply, reasoningNodeIds });
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
