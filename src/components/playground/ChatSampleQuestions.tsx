"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface SampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export const SAMPLE_QUESTIONS = [
  "What is the overall architecture of this project?",
  "Explain the ReAct Agent Loop feature",
  "Which files implement Human-in-the-Loop?",
];

export function ChatSampleQuestions({
  onSelectQuestion,
  disabled,
}: SampleQuestionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-2 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#a3b18a]/20 text-[#2d3a2b] dark:text-[#cce3c0]">
          <Sparkles className="h-3 w-3" />
        </span>
        <h4 className="text-xs font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
          Suggested Explorations
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {SAMPLE_QUESTIONS.map((question, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuestion(question)}
            className="group flex flex-col justify-between text-left p-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/70 dark:bg-[#151a16]/70 hover:border-[#a3b18a] hover:bg-white dark:hover:bg-[#1a211b] hover:shadow-2xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug group-hover:text-[#2d3a2b] dark:group-hover:text-[#cce3c0] transition-colors">
              {question}
            </p>
            <div className="mt-3 flex items-center justify-end text-zinc-400 dark:text-zinc-500 group-hover:text-[#5e7755] dark:group-hover:text-[#a3b18a] transition-colors">
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
