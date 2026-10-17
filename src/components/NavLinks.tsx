"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const navLinks = [
    {
      label: "Home",
      href: "/",
      isActive: pathname === "/",
    },
    {
      label: "Playground",
      href: "/chat",
      isActive: pathname.startsWith("/chat"),
    },
    {
      label: "Graph",
      href: "/graph",
      isActive: pathname.startsWith("/graph"),
    },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 sm:gap-1.5">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
              link.isActive
                ? "bg-[#a3b18a]/20 text-[#2d3b2b] dark:text-[#cce3c0] border border-[#a3b18a]/40 font-semibold shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Auth actions*/}
      <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm">
        {status === "loading" ? (
          <div className="h-8 w-16 animate-pulse rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60" />
        ) : session?.user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a3b18a] text-[10px] font-bold text-[#0f1410] shadow-xs">
                {(
                  session.user.name?.[0] ||
                  session.user.email?.[0] ||
                  "U"
                ).toUpperCase()}
              </span>
              <span className="max-w-22.5 sm:max-w-32.5 truncate font-medium text-xs text-zinc-800 dark:text-zinc-200">
                {session.user.name || session.user.email}
              </span>
            </div>
            <button
              onClick={async () => {
                await signOut({ redirect: false, callbackUrl: "/" });
                router.push("/");
                router.refresh();
              }}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/30 text-xs font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link
              href="/signin"
              className="px-3 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 text-xs font-medium transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded-xl bg-[#a3b18a] hover:bg-[#93a17a] dark:bg-[#a3b18a] dark:hover:bg-[#b5cca7] text-[#0f1410] text-xs font-semibold transition shadow-xs active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
