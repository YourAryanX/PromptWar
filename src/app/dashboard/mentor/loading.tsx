export default function MentorLoading() {
  return (
    <div className="h-full flex flex-col max-h-[85vh] animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-10 bg-white/10 rounded-md w-48 mb-2" />
          <div className="h-4 bg-white/10 rounded-md w-64" />
        </div>
        <div className="h-10 bg-white/10 rounded-full w-32" />
      </div>

      <div className="flex-1 glass rounded-3xl border-white/10 overflow-hidden flex flex-col shadow-2xl relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4 justify-end">
            <div className="max-w-[80%] rounded-2xl p-4 h-16 w-64 bg-primary/20" />
            <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
          </div>
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0" />
            <div className="max-w-[80%] rounded-2xl p-4 h-32 w-96 bg-white/10" />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 h-20" />
      </div>
    </div>
  )
}
