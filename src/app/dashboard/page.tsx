import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardOverviewClient from './page-client'

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch the user's active project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch task counts
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('project_id', project?.id ?? '00000000-0000-0000-0000-000000000000')

  const total = tasks?.length ?? 0
  const done = tasks?.filter(t => t.status === 'done').length ?? 0

  return (
    <DashboardOverviewClient 
      project={project}
      taskTotal={total}
      taskDone={done}
    />
  )
}
