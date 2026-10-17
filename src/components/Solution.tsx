export function Solution() {
  return (
    <section className="px-6 py-20 border-t border-zinc-200/80 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-medium text-emerald-600 dark:text-[#a3b18a] mb-3">The Solution</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mb-6 max-w-2xl">
          Give your agent a real knowledge graph.
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-3xl leading-relaxed mb-12">
          CodeWeaver converts your repository into a structured graph of files,
          functions, modules, features, and ownership. The agent doesn’t just
          retrieve — it traverses relationships and shows you the exact path it
          followed.
        </p>

        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 md:p-10 shadow-xs dark:shadow-none">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-4">
                From files → to connected knowledge
              </h3>
              <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3">
                  <span className="text-emerald-600 dark:text-[#a3b18a]">→</span>
                  Multi-hop reasoning across modules
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 dark:text-[#a3b18a]">→</span>
                  Clear feature → implementation mapping
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 dark:text-[#a3b18a]">→</span>
                  Impact analysis & ownership queries
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 dark:text-[#a3b18a]">→</span>
                  Transparent reasoning paths
                </li>
              </ul>
            </div>
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6 text-sm text-zinc-400 font-mono">
              <p className="text-[#a3b18a] mb-2">
                {"// Example reasoning path"}
              </p>
              <p>Feature: ReAct Agent Loop</p>
              <p className="pl-3">↓ IMPLEMENTS</p>
              <p className="pl-6">File: graph.ts</p>
              <p className="pl-9">↓ BELONGS_TO</p>
              <p className="pl-12">Module: Agent Core</p>
              <p className="pl-9">↓ CALLS</p>
              <p className="pl-12">Function: tool-executor</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
