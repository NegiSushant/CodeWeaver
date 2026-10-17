"use client";

import { useState, KeyboardEvent } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSendDisabled = isLoading || !input.trim();

  return (
    <div className="border-t border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#121614]/80 backdrop-blur-md p-4 transition-colors">
      <div className="max-w-3xl mx-auto flex gap-2.5 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about architecture, features, impact analysis..."
          rows={1}
          className="flex-1 resize-none rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#a3b18a] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSendDisabled}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#a3b18a] hover:bg-[#93a17a] active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 text-[#0f1410] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#0f1410]" />
          ) : (
            <ArrowUp className="h-4.5 w-4.5 stroke-[2.5]" />
          )}
        </button>
      </div>
    </div>
  );
}
