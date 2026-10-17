import type { NodeLabel } from "@/types/graph";

const GRAPH_ITEMS: { label: NodeLabel; color: string }[] = [
  { label: "File", color: "#6366f1" },
  { label: "Function", color: "#22d3ee" },
  { label: "Class", color: "#f59e0b" },
  { label: "Module", color: "#10b981" },
  { label: "Feature", color: "#ec4899" },
  { label: "Person", color: "#a78bfa" },
];

export function GraphLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 py-2.5">
      {GRAPH_ITEMS.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: "#facc15" }}
        />
        <span className="text-[11px] font-medium text-yellow-600 dark:text-yellow-400">Reasoning path</span>
      </div>
    </div>
  );
}
