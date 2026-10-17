import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { Network } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onViewGraph?: (nodeIds: number[]) => void;
}

export function MessageBubble({ message, onViewGraph }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasNodes = Boolean(message.reasoningNodeIds && message.reasoningNodeIds.length > 0);

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4.5 py-3.5 text-sm leading-relaxed shadow-2xs transition-colors",
          isUser
            ? "bg-[#a3b18a] text-[#0f1410] font-medium rounded-tr-xs"
            : "bg-white dark:bg-[#151a16] text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-xs",
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {!isUser && (
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              CodeWeaver Agent
            </span>
            <button
              type="button"
              onClick={() => onViewGraph?.(message.reasoningNodeIds || [])}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:border-[#a3b18a] hover:bg-[#a3b18a]/15 hover:text-[#2d3a2b] dark:hover:text-[#cce3c0] transition cursor-pointer shadow-2xs"
              title="Inspect reasoning subgraph traversal for this answer"
            >
              <Network className="h-3.5 w-3.5 text-[#5e7755] dark:text-[#a3b18a]" />
              <span>Reasoning Path</span>
              {hasNodes && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#a3b18a]/20 font-bold text-[#354832] dark:text-[#cce3c0]">
                  {message.reasoningNodeIds?.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

