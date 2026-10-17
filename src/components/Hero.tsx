import Link from "next/link";

export function Hero() {
  return (
    <section className="relative px-6 pt-20 pb-24 max-w-6xl mx-auto">
      <div className="flex flex-col items-start gap-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-700 dark:text-zinc-400 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#a3b18a]"></span>
          Graph-Powered Code Intelligence
        </div>

        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-white max-w-3xl leading-[1.15]">
          Understand your codebase. <br />
          <span className="text-emerald-600 dark:text-[#cce3c0]">Not just search it.</span>
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          CodeWeaver turns your repository into a living knowledge graph. Ask
          complex questions about architecture, impact, ownership, and features
          — and get answers with clear reasoning paths.
        </p>

        <div className="flex flex-wrap gap-4 mt-4">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 transition shadow-sm hover:shadow-md hover:shadow-emerald-500/20 active:scale-95"
          >
            Try CodeWeaver
            <span>→</span>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 px-6 py-3 transition"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
