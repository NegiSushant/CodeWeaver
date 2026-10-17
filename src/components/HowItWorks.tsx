const steps = [
  {
    number: "01",
    title: "Ingest the codebase",
    description:
      "We parse your repository and build a rich graph of files, functions, modules, and features.",
  },
  {
    number: "02",
    title: "Enrich with meaning",
    description:
      "High-level features, ownership, and key relationships are added so the graph becomes truly useful.",
  },
  {
    number: "03",
    title: "Ask in natural language",
    description:
      "The agent uses graph tools to traverse relationships and answer complex questions.",
  },
  {
    number: "04",
    title: "See the reasoning",
    description:
      "Along with the answer, you get the exact path through the graph that led to it.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-6 py-20 border-t border-zinc-200/80 dark:border-zinc-800/60"
    >
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-medium text-emerald-600 dark:text-[#a3b18a] mb-3">How it works</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mb-12">
          From repository to reasoning
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-5">
              <div className="text-2xl font-semibold text-emerald-600 dark:text-[#a3b18a] w-12 flex-shrink-0">
                {step.number}
              </div>
              <div>
                <h3 className="text-zinc-900 dark:text-white font-medium mb-1">{step.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
