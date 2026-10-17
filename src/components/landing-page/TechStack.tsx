const usedTechStack = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "FalkorDB",
  "LangChain",
  "LangGraph",
  "PostgreSQL",
  "Prisma ORM",
  "Docker",
];

export function TechStack() {
  return (
    <section className="px-6 py-20 border-t border-zinc-200/80 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm font-medium text-emerald-600 dark:text-[#a3b18a] mb-3">
          Built with
        </p>
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white mb-10">
          Modern, production-ready stack
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          {usedTechStack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-zinc-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 px-5 py-2 text-sm text-zinc-700 dark:text-zinc-300 shadow-2xs"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
