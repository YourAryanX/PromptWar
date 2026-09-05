'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createProject(
  title: string,
  description: string,
  techStack: string[],
  difficulty: string,
  wowFactor: string
) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title,
      description,
      tech_stack: techStack,
      difficulty,
      wow_factor: wowFactor,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Seed a few starter tasks from the AI-suggested tech stack
  const starterTasks = [
    { title: `Set up project repository & README`, status: 'todo', difficulty: 'Easy', sort_order: 0 },
    { title: `Configure development environment`, status: 'todo', difficulty: 'Easy', sort_order: 1 },
    { title: `Design database schema`, status: 'todo', difficulty: 'Medium', sort_order: 2 },
    { title: `Build core UI layouts`, status: 'todo', difficulty: 'Medium', sort_order: 3 },
    { title: `Implement authentication`, status: 'todo', difficulty: 'Medium', sort_order: 4 },
  ]

  await supabase.from('tasks').insert(
    starterTasks.map((t) => ({ ...t, project_id: data.id }))
  )

  redirect('/dashboard')
}
