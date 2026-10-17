"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { LoadingIndicator } from "./LoadingIndicator";
import { SampleQuestions } from "./SampleQuestions";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onViewGraph?: (nodeIds: number[]) => void;
  onSelectSampleQuestion?: (question: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  onViewGraph,
  onSelectSampleQuestion,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-transparent transition-colors">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
              Welcome to <span className="text-[#566e4e] dark:text-[#a3b18a]">CodeWeaver</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
              Ask deep architectural questions, discover dependencies, and inspect reasoning paths across your codebase.
            </p>
          </div>

          {onSelectSampleQuestion && (
            <SampleQuestions
              onSelectQuestion={onSelectSampleQuestion}
              disabled={isLoading}
            />
          )}
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onViewGraph={onViewGraph}
        />
      ))}

      {isLoading && <LoadingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
