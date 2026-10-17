"use client";

import { useState } from "react";
import type { Message } from "@/types/chat";
import { ChatInput } from "../../components/playground/ChatInput";
import { GraphPanel } from "@/components/graph/GraphPanel";
import { MessageList } from "@/components/playground/MessageList";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reasoningNodeIds, setReasoningNodeIds] = useState<number[]>([]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        reasoningNodeIds?: number[];
        error?: string;
      };

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply ?? "Sorry, I couldn't generate a response.",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (Array.isArray(data.reasoningNodeIds)) {
        setReasoningNodeIds(data.reasoningNodeIds);
      }
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong while contacting the agent.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-61px)] overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-200">
      <div className="flex w-[60%] min-w-0 flex-col">
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>

      <div className="w-[40%] min-w-0">
        <GraphPanel highlightedNodeIds={reasoningNodeIds} />
      </div>
    </div>
  );
}
