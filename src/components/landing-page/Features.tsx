const features = [
  {
    title: "Architecture Understanding",
    description:
      "Ask about modules, layers, and how different parts of the system connect.",
  },
  {
    title: "Impact Analysis",
    description:
      "Instantly see what depends on a file, function, or module before you change it.",
  },
  {
    title: "Feature Mapping",
    description:
      "Trace high-level features down to the exact files and functions that implement them.",
  },
  {
    title: "Ownership Awareness",
    description:
      "Know who owns what — useful for reviews, onboarding, and accountability.",
  },
  {
    title: "Explainable Answers",
    description:
      "Every response can show the exact graph path the agent followed.",
  },
  {
    title: "Built for Agents",
    description:
      "Designed from the ground up so AI agents can reason over connected code knowledge.",
  },
];

export function Features() {
  return (
    <section className="px-6 py-20 border-t border-zinc-200/80 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-medium text-emerald-600 dark:text-[#a3b18a] mb-3">Capabilities</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mb-12">
          What you can ask CodeWeaver
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 hover:border-emerald-500/50 dark:hover:border-zinc-700 shadow-xs dark:shadow-none transition"
            >
              <h3 className="text-zinc-900 dark:text-white font-medium mb-2">{feature.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
