import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import KanbanClient from './kanban-client'

export const metadata: Metadata = {
  title: 'Build Roadmap — PromptWar',
  description: 'Manage your project milestones with a Kanban board.',
}

export default async function KanbanPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/login')
  const user = session.user

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
