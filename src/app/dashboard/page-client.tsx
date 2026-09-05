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
  } | null
  taskTotal: number
  taskDone: number
}

export default function DashboardOverviewClient({ project, taskTotal, taskDone }: Props) {
  const router = useRouter()
  const progress = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 text-center space-y-6">
        <Sparkles className="w-16 h-16 text-primary/40" />
        <h2 className="text-3xl font-bold">No project yet!</h2>
        <p className="text-muted-foreground max-w-sm">
          You haven't selected a capstone project. Let our AI Mentor generate ideas tailored to your skills.
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
          { title: 'Submission Date', value: project.submission_date ?? 'Not set', icon: Clock, color: 'text-rose-500' },
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
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="col-span-2">
          <Card className="glass-panel border-white/10 h-full">
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">{project.description}</p>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tech Stack</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tech_stack.map((tech) => (
                    <span key={tech} className="text-xs px-2 py-1 bg-white/10 dark:bg-white/10 rounded-md border border-white/10">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass border-white/10 h-full bg-primary/5">
            <CardHeader><CardTitle className="text-primary">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => router.push('/dashboard/kanban')} variant="outline" className="w-full rounded-xl">
                View Kanban Board
              </Button>
              <Button onClick={() => router.push('/dashboard/mentor')} variant="outline" className="w-full rounded-xl">
                Open AI Mentor
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
