'use server'

import { createClient } from '@/utils/supabase/server'
import { projectSchema } from '@/lib/validations'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export async function createProject(
  title: string,
  description: string,
  techStack: string[],
  difficulty: string,
  wowFactor: string
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Unauthorized' }
    }

    const validatedData = projectSchema.parse({ title, description, techStack, difficulty, wowFactor })

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        tech_stack: validatedData.techStack,
        difficulty: validatedData.difficulty,
        wow_factor: validatedData.wowFactor,
      })
      .select('id')
      .single()

    if (error) {
      return { error: error.message }
    }

    // Generate project-specific milestones using Gemini
    let starterTasks = []
    try {
      const { object } = await generateObject({
        model: google('gemini-3.8-flash'),
        schema: z.object({
          tasks: z.array(
            z.object({
              title: z.string().describe('The task title, e.g., "Set up Next.js repository"'),
              difficulty: z.enum(['Easy', 'Medium', 'Hard']),
            })
          ).length(7).describe('Exactly 7 sequential development tasks from setup to deployment'),
        }),
        prompt: `You are an expert technical project manager. Break down the following capstone project into exactly 7 sequential development tasks (Kanban milestones).
        Project Title: ${validatedData.title}
        Description: ${validatedData.description}
        Tech Stack: ${validatedData.techStack.join(', ')}
        Wow Factor: ${validatedData.wowFactor}
        
        The tasks should follow a logical software development lifecycle (e.g., Setup -> Schema -> Core API -> Core UI -> Feature X -> Wow Factor -> Testing/Deployment).`,
      })
      
      starterTasks = object.tasks.map((t, index) => ({
        title: t.title,
        status: 'todo',
        difficulty: t.difficulty,
        sort_order: index
      }))
    } catch (aiError) {
      console.error('Failed to generate AI tasks, falling back to defaults', aiError)
      // Fallback tasks
      starterTasks = [
        { title: `Set up project repository & README`, status: 'todo', difficulty: 'Easy', sort_order: 0 },
        { title: `Configure development environment`, status: 'todo', difficulty: 'Easy', sort_order: 1 },
        { title: `Design database schema`, status: 'todo', difficulty: 'Medium', sort_order: 2 },
        { title: `Build core UI layouts`, status: 'todo', difficulty: 'Medium', sort_order: 3 },
        { title: `Implement authentication`, status: 'todo', difficulty: 'Medium', sort_order: 4 },
      ]
    }

    await supabase.from('tasks').insert(
      starterTasks.map((t) => ({ ...t, project_id: data.id }))
    )

    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Validation failed' }
  }
}

export async function updateProjectDeadline(projectId: string, deadline: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('projects')
      .update({ submission_date: deadline })
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update deadline' }
  }
}
