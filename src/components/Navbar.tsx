"use client";

import Link from "next/link";
import { Suspense } from "react";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0c0f0d]/85 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a3b18a] text-[#0f1410] shadow-sm group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M8.5 8.5l7 7" />
              <circle cx="18" cy="6" r="3" />
              <path d="M15.5 8.5l-7 7" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Code
              <span className="text-[#566e4e] dark:text-[#a3b18a]">Weaver</span>
            </span>
            <span className="hidden sm:inline-flex rounded-md bg-[#a3b18a]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#2d3a2b] dark:text-[#cce3c0] border border-[#a3b18a]/30">
              GRAPH
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Suspense
            fallback={
              <div className="flex items-center gap-3">
                <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60" />
                <div className="h-8 w-16 animate-pulse rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60" />
              </div>
            }
          >
            <NavLinks />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
