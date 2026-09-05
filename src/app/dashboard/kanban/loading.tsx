export default function KanbanLoading() {
  return (
    <div className="h-full flex flex-col animate-pulse">
      <div className="mb-8">
        <div className="h-10 bg-white/10 rounded-md w-1/3 mb-4" />
        <div className="h-6 bg-white/10 rounded-md w-1/4" />
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max h-full pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-80 flex flex-col">
              <div className="glass-panel p-4 rounded-t-2xl border-b-0 border-white/10 h-16" />
              <div className="glass flex-1 rounded-b-2xl p-4 border-t-0 border-white/10 bg-black/5 dark:bg-white/5 space-y-4">
                <div className="h-24 bg-white/10 rounded-xl" />
                <div className="h-24 bg-white/10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
