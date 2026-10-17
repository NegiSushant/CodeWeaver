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
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 sm:gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 ${
              link.isActive
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Auth actions divider */}
      <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm">
        {status === "loading" ? (
          <div className="h-8 w-16 animate-pulse rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60" />
        ) : session?.user ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-[10px] font-bold text-white shadow-xs">
                {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
              </span>
              <span className="max-w-[100px] sm:max-w-[140px] truncate font-medium text-xs text-zinc-800 dark:text-zinc-200">
                {session.user.name || session.user.email}
              </span>
            </div>
            <button
              onClick={async () => {
                await signOut({ redirect: false, callbackUrl: "/" });
                router.push("/");
                router.refresh();
              }}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/30 text-xs font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="px-3 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 text-xs font-medium transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium transition shadow-sm hover:shadow-md hover:shadow-emerald-500/20 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

