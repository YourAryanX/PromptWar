import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MentorClient from './mentor-client'

export default async function MentorPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/login')
  const user = session.user

  // Get the active project
  const { data: project } = await supabase
    .from('projects')
    .select('id, title, tech_stack')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!project) redirect('/ideas')

  // Get the last 15 messages for context
  const { data: history } = await supabase
    .from('chat_history')
    .select('role, content')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(15)

  const messages = (history ?? []).reverse().map((m, i) => ({
    id: `history-${i}`,
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  return (
    <MentorClient
      projectId={project.id}
      projectTitle={project.title}
      techStack={project.tech_stack}
      initialMessages={messages}
    />
  )
}
