import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

import agent from "@/lib/agents/reactAgent";

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
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        }

        if (msg.role === "assistant") {
          return new AIMessage(msg.content);
        }

        throw new Error(`Unsupported message role: ${msg.role}`);
      },
    );

    const messages = [...historyMessages, new HumanMessage(message)];

    // Invoke the imported React agent.
    const result = await agent.invoke({
      messages,
    });

    // Get the last AI response, not a tool message.
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

    return NextResponse.json({ reply });
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
