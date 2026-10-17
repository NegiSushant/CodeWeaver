export function Problem() {
  return (
    <section className="px-6 py-20 border-t border-zinc-200/80 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-medium text-emerald-600 dark:text-[#a3b18a] mb-3">The Problem</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mb-6 max-w-2xl">
          Most code assistants still treat your codebase as a bag of files.
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-3xl leading-relaxed">
          Vector search is great for finding similar code. But it fails when you
          ask questions that depend on relationships — “What breaks if I change
          this?”, “Who owns this module?”, or “How is this feature actually
          implemented?”
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: "No real relationships",
              desc: "Traditional RAG can’t follow multi-hop dependencies across modules.",
            },
            {
              title: "Weak explainability",
              desc: "You get an answer, but not the path the system used to reach it.",
            },
            {
              title: "Poor architectural understanding",
              desc: "Agents struggle with ownership, feature boundaries, and impact analysis.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 shadow-xs dark:shadow-none"
            >
              <h3 className="text-zinc-900 dark:text-white font-medium mb-2">{item.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
