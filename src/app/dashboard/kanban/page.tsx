import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import KanbanClient from './kanban-client'

export default async function KanbanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get the active project
  const { data: project } = await supabase
    .from('projects')
    .select('id, title')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!project) redirect('/ideas')

  // Get all tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true })

  return <KanbanClient initialTasks={tasks ?? []} projectId={project.id} projectTitle={project.title} />
}
