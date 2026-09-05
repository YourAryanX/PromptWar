import Link from 'next/link'
import { Sparkles, ArrowRight, BrainCircuit, Rocket, CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* Background Animated Blobs */}
      <div className="absolute top-[10%] -left-[10%] w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[10%] -right-[10%] w-[25rem] h-[25rem] bg-rose-500/10 rounded-full blur-3xl -z-10" />

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-glow">PromptWar</h1>
        </div>
        <Link 
          href="/login" 
          className="px-6 py-2 rounded-full glass hover:bg-white/10 transition-colors border border-white/20 text-sm font-medium"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-20 mb-32 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 mb-8 text-sm text-primary">
          <Sparkles className="w-4 h-4" />
          <span>Your AI Capstone Mentor is here</span>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
          Don&apos;t just build a project.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-primary to-rose-400 text-glow">
            Build a Masterpiece.
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          The ultimate platform for final-year engineering students. Generate unique project ideas based on your skills, plan your roadmap, and get unblocked with an AI mentor that knows your codebase.
        </p>

        <Link 
          href="/login" 
          className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(var(--primary),0.5)] flex items-center gap-2"
        >
          Start Your Project Free <ArrowRight className="w-5 h-5" />
        </Link>
      </main>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-32 z-10">
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center border-white/10 hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">AI Idea Generator</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Input your skills and interests. Our AI will craft 3 highly-impressive, realistic capstone project concepts tailored just for you.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center border-white/10 hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Automated Roadmaps</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Once you pick an idea, we automatically break it down into a Kanban board with step-by-step development milestones.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center border-white/10 hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Rocket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">24/7 Contextual Mentor</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Stuck on a bug? Our AI mentor knows your exact tech stack and project goals, providing targeted code snippets and viva prep.
          </p>
        </div>
      </section>
    </div>
  )
}
