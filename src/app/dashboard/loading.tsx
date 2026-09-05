export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-10 animate-pulse">
      <div>
        <div className="h-10 bg-white/10 rounded-md w-1/3 mb-4" />
        <div className="h-6 bg-white/10 rounded-md w-1/4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card border-white/10 h-32 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 glass-panel border-white/10 h-64 rounded-xl" />
        <div className="glass border-white/10 h-64 rounded-xl bg-primary/5" />
      </div>
    </div>
  )
}
