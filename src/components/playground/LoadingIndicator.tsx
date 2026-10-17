export function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-zinc-800 text-zinc-300 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
        </span>
        <span>Thinking with graph...</span>
      </div>
    </div>
  );
}
