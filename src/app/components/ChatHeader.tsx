export function ChatHeader() {
  return (
    <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-950">
      <div>
        <h1 className="text-lg font-semibold text-white">CodeWeaver</h1>
        <p className="text-sm text-zinc-400">
          Ask anything about the AutoPA codebase
        </p>
      </div>
      <div className="text-xs text-zinc-500">
        Powered by FalkorDB + LangChain
      </div>
    </div>
  );
}
