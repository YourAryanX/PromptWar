'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle2, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Props {
  project: {
    id: string
    title: string
    description: string
    tech_stack: string[]
    difficulty: string
    submission_date: string | null
    wow_factor?: string | null
  } | null
  taskTotal: number
  taskDone: number
  tasks?: { id: string, title: string, status: string, sort_order: number }[] | null
}

export default function DashboardOverviewClient({ project, taskTotal, taskDone, tasks }: Props) {
  const router = useRouter()
  const progress = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0
  
  let daysRemaining = 'Not set'
  if (project?.submission_date) {
    const target = new Date(project.submission_date).getTime()
    const now = new Date().getTime()
    const diff = target - now
    if (diff > 0) {
      daysRemaining = `${Math.ceil(diff / (1000 * 60 * 60 * 24))} days left`
    } else {
      daysRemaining = 'Deadline passed'
    }
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 text-center space-y-6">
        <Sparkles className="w-16 h-16 text-primary/40" />
        <h2 className="text-3xl font-bold">No project yet!</h2>
        <p className="text-muted-foreground max-w-sm">
          You haven&apos;t selected a capstone project. Let our AI Mentor generate ideas tailored to your skills.
        </p>
        <Button onClick={() => router.push('/ideas')} size="lg" className="rounded-full px-8">
          Generate My Ideas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight text-glow mb-2">Project Hub</h1>
        <p className="text-muted-foreground text-lg">{project.title}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Overall Progress', value: `${progress}%`, icon: TrendingUp, color: 'text-primary' },
          { title: 'Difficulty', value: project.difficulty ?? 'N/A', icon: AlertCircle, color: 'text-amber-500' },
          { title: 'Tasks Completed', value: `${taskDone}/${taskTotal}`, icon: CheckCircle2, color: 'text-green-500' },
          { title: 'Submission Date', value: daysRemaining, icon: Clock, color: 'text-rose-500' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                {i === 0 && <Progress value={progress} className="mt-3 h-2" />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="col-span-2 space-y-6">
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle>Project Architecture & Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground/80 leading-relaxed text-sm md:text-base">{project.description}</p>
              
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">The Wow Factor</span>
                </div>
                <p className="text-sm text-primary/80 leading-relaxed">{project.wow_factor || "An impressive feature designed to wow your examiners."}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Technology Stack</span>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <span key={tech} className="text-xs px-3 py-1.5 bg-white/5 dark:bg-white/10 rounded-lg border border-white/10 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle>Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {tasks?.length ? (
                  tasks.map((task, i) => (
                  <div key={task.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${task.status === 'done' ? 'is-active' : ''}`}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-background group-[.is-active]:bg-primary/20 group-[.is-active]:border-primary/50 group-[.is-active]:text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-primary/20 z-10">
                      {task.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/5 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{task.title}</span>
                        <span className="text-xs text-muted-foreground">{task.status === 'done' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Milestone {i + 1} of your roadmap.</p>
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic">No tasks created yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-6">
          <Card className="glass border-white/10 bg-primary/5">
            <CardHeader><CardTitle className="text-primary flex items-center gap-2"><Sparkles className="w-5 h-5"/> Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => router.push('/dashboard/kanban')} variant="outline" className="w-full rounded-xl border-primary/20 hover:bg-primary/10">
                Manage Kanban Board
              </Button>
              <Button onClick={() => router.push('/dashboard/mentor')} variant="outline" className="w-full rounded-xl border-primary/20 hover:bg-primary/10">
                Ask AI Mentor
              </Button>
              <Button onClick={() => router.push('/dashboard/docs')} variant="outline" className="w-full rounded-xl border-primary/20 hover:bg-primary/10">
                Generate Final Report
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader><CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Recent Mentor Activity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-black/20 text-sm border border-white/5 relative">
                <div className="absolute -left-1.5 top-4 w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-indigo-300 font-medium mb-1">Architecture Advice</p>
                <p className="text-muted-foreground text-xs leading-relaxed">&quot;Given your tech stack, I recommend using Prisma ORM for type safety with your Next.js API routes.&quot;</p>
              </div>
              <div className="p-3 rounded-lg bg-black/20 text-sm border border-white/5 relative">
                <div className="absolute -left-1.5 top-4 w-3 h-3 rounded-full bg-rose-500" />
                <p className="text-rose-300 font-medium mb-1">Code Review</p>
                <p className="text-muted-foreground text-xs leading-relaxed">&quot;Your authentication logic is solid, but remember to add middleware for route protection.&quot;</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
