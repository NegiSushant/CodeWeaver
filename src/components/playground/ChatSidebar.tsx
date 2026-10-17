"use client";

import Link from "next/link";
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Network,
  Clock,
} from "lucide-react";
import type { ChatSessionSummary } from "@/types/chat";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  isLoadingSessions?: boolean;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isLoadingSessions,
}: ChatSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 md:static flex flex-col h-[calc(100vh-61px)] bg-[#f7f5f0] dark:bg-[#0f1311] border-r border-zinc-200/80 dark:border-zinc-850 transition-all duration-300 ease-in-out ${
        isOpen
          ? "w-72 translate-x-0 opacity-100"
          : "w-0 -translate-x-full md:w-0 md:translate-x-0 opacity-0 overflow-hidden pointer-events-none"
      }`}
    >
      {/* Top Header / Actions */}
      <div className="p-3.5 border-b border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#a3b18a] hover:bg-[#93a17a] text-[#0f1410] font-semibold text-xs transition shadow-2xs active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Chat</span>
        </button>

        <button
          type="button"
          onClick={onToggle}
          title="Close sidebar"
          aria-label="Collapse sidebar"
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <PanelLeftClose className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* History Session List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <span>Conversations</span>
          <span className="text-[10px] font-mono">{sessions.length}</span>
        </div>

        {isLoadingSessions ? (
          <div className="space-y-2 px-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-9 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/40 animate-pulse"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Clock className="h-6 w-6 text-zinc-300 dark:text-zinc-700 mb-2" />
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              No chat history yet
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Start your first conversation
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#a3b18a]/15 text-[#2d3a2b] dark:text-[#cce3c0] border border-[#a3b18a]/35 font-medium shadow-2xs"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-850/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                  <MessageSquare
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive
                        ? "text-[#5e7755] dark:text-[#a3b18a]"
                        : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                    }`}
                  />
                  <span className="truncate">{session.title}</span>
                </div>

                {/* Delete button on hover or active */}
                <button
                  type="button"
                  title="Delete conversation"
                  aria-label="Delete chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation link */}
      <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
        <Link
          href="/graph"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#2d3a2b] dark:hover:text-[#cce3c0] hover:bg-[#a3b18a]/10 transition"
        >
          <Network className="h-4 w-4 text-[#5e7755] dark:text-[#a3b18a]" />
          <span>Full Knowledge Graph</span>
        </Link>
      </div>
    </aside>
  );
}
