"use client";

import { useState, useEffect, useCallback } from "react";
import { PanelLeftOpen } from "lucide-react";
import type { Message, ChatSessionSummary } from "@/types/chat";
import { ChatInput } from "@/components/playground/ChatInput";
import { MessageList } from "@/components/playground/MessageList";
import { ChatSidebar } from "@/components/playground/ChatSidebar";
import { ReasoningPathModal } from "@/components/playground/ReasoningPathModal";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [modalNodeIds, setModalNodeIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat/sessions")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) {
          setSessions(data);
          setIsLoadingSessions(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingSessions(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to refresh sessions:", err);
    }
  }, []);

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    try {
      setIsLoadingMessages(true);
      setActiveSessionId(sessionId);
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          (data.messages || []).map(
            (m: {
              id: string;
              role: string;
              content: string;
              reasoningNodeIds?: number[];
              createdAt: string;
            }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              reasoningNodeIds: m.reasoningNodeIds || [],
              createdAt: new Date(m.createdAt),
            }),
          ),
        );
      }
    } catch (err) {
      console.error("Failed to load session messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleOpenGraphModal = (nodeIds: number[]) => {
    setModalNodeIds(nodeIds);
    setIsModalOpen(true);
  };

  const handleCloseGraphModal = () => {
    setIsModalOpen(false);
  };

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

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
          sessionId: activeSessionId,
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        reasoningNodeIds?: number[];
        sessionId?: string;
        error?: string;
      };

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply ?? "Sorry, I couldn't generate a response.",
        createdAt: new Date(),
        reasoningNodeIds: Array.isArray(data.reasoningNodeIds)
          ? data.reasoningNodeIds
          : [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.sessionId && data.sessionId !== activeSessionId) {
        setActiveSessionId(data.sessionId);
      }

      // Refresh sessions in background to update title & last updated timestamp
      refreshSessions();
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong while contacting the agent.",
        createdAt: new Date(),
        reasoningNodeIds: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-61px)] w-full overflow-hidden bg-[#fbf9f5] dark:bg-[#0c0f0d] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Grok-style Chat History Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isLoadingSessions={isLoadingSessions}
      />

      {/* Main Chat Area */}
      <div className="relative flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Toggle button when sidebar is collapsed */}
        {!isSidebarOpen && (
          <div className="absolute top-3.5 left-4 z-20">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              title="Open chat history sidebar"
              aria-label="Open sidebar"
              className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-xs hover:border-[#a3b18a] transition cursor-pointer"
            >
              <PanelLeftOpen className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {/* Repeating watermark background */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
          aria-hidden="true"
        >
          <div className="absolute inset-[-20%] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16 place-items-center rotate-[-35deg]">
            {Array.from({ length: 24 }).map((_, index) => (
              <span
                key={index}
                className="whitespace-nowrap text-[clamp(1.5rem,3vw,3rem)] font-black tracking-widest uppercase text-zinc-900/[0.035] dark:text-white/[0.04]"
              >
                CodeWeaver
              </span>
            ))}
          </div>
        </div>

        {/* Messages & Input */}
        <div className="relative z-10 flex flex-col flex-1 h-full min-w-0 max-w-4xl mx-auto w-full">
          <MessageList
            messages={messages}
            isLoading={isLoading || isLoadingMessages}
            onViewGraph={handleOpenGraphModal}
            onSelectSampleQuestion={handleSend}
          />
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading || isLoadingMessages}
          />
        </div>
      </div>

      {/* Reasoning subgraph modal */}
      <ReasoningPathModal
        isOpen={isModalOpen}
        onClose={handleCloseGraphModal}
        nodeIds={modalNodeIds}
      />
    </div>
  );
}
