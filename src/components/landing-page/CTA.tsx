import Link from "next/link";

export function CTA() {
  return (
    <section className="px-6 py-24 border-t border-zinc-200/80 dark:border-zinc-800/60">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mb-6">
          Ready to understand your code at a deeper level?
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-10">
          Start asking questions that vector search simply can’t answer.
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 transition text-base shadow-md shadow-emerald-500/20 active:scale-95"
        >
          Launch CodeWeaver
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
