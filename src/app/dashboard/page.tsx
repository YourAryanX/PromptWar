import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardOverviewClient from './page-client'

export default async function DashboardOverview() {
  const supabase = await createClient()
  // Use getSession for significantly faster load times than getUser (skips network call if JWT is valid)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/login')
  const user = session.user

  // Fetch the user's active project
  const { data: project } = await supabase
    .from('projects')
    .select('id, title, description, tech_stack, difficulty, submission_date, wow_factor')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch task counts and details
  let tasks = null
  if (project?.id) {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, status, sort_order')
      .eq('project_id', project.id)
      .order('sort_order', { ascending: true })
    tasks = data
  }

  const total = tasks?.length ?? 0
  const done = tasks?.filter(t => t.status === 'done').length ?? 0

  return (
    <DashboardOverviewClient 
      project={project}
      taskTotal={total}
      taskDone={done}
      tasks={tasks}
    />
  )
}
