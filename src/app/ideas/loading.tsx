export default function IdeasLoading() {
  return (
    <div className="min-h-screen p-4 md:p-12 relative overflow-hidden flex flex-col items-center animate-pulse">
      <div className="w-full max-w-6xl z-10 relative">
        <div className="mb-12 text-center">
          <div className="h-12 w-64 bg-white/10 rounded-md mx-auto mb-4" />
          <div className="h-4 w-96 bg-white/10 rounded-md mx-auto mb-8" />
          <div className="h-12 w-48 bg-primary/20 rounded-xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-3xl overflow-hidden flex flex-col border-white/10 h-96">
              <div className="p-6">
                <div className="h-8 bg-white/10 rounded-md w-3/4 mb-4" />
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-white/10 rounded-md w-full" />
                  <div className="h-4 bg-white/10 rounded-md w-5/6" />
                  <div className="h-4 bg-white/10 rounded-md w-4/6" />
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  <div className="h-6 w-16 bg-white/10 rounded-full" />
                  <div className="h-6 w-20 bg-white/10 rounded-full" />
                  <div className="h-6 w-14 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
