import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@/utils/supabase/server'
import rateLimit from '@/lib/rate-limit'

export const maxDuration = 60

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await limiter.check(10, user.id)
  } catch {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  const { messages, projectId } = await req.json()

  // Fetch project from DB to prevent prompt injection and verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('title, tech_stack')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    return new Response('Project not found or unauthorized', { status: 404 })
  }

  // Fetch current tasks to provide better context
  const { data: tasks } = await supabase
    .from('tasks')
    .select('title, status')
    .eq('project_id', projectId)

  const taskContext = tasks?.length 
    ? tasks.map(t => `- ${t.title} (${t.status})`).join('\n') 
    : 'No tasks added yet.'

  // Persist the new user message to Supabase
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === 'user') {
      await supabase.from('chat_history').insert({
        project_id: projectId,
        role: 'user',
        content: lastMessage.content,
      })
    }
  }

  const systemPrompt = `You are an expert AI mentor for final-year engineering students.

The student's current capstone project is: "${project.title}"
Tech stack: ${project.tech_stack?.join(', ') || 'Not specified'}

Current Roadmap & Progress:
${taskContext}

Your role:
- Provide specific, actionable advice (not generic) based on their actual current progress.
- Be honest and direct when ideas won't work
- Suggest concrete code snippets, architecture decisions, and debugging steps
- Remember you know their full project context
- Help them prepare for exams and viva questions
- Keep responses focused and structured — use bullet points and code blocks where helpful
- Never say "great question!" or use filler phrases
`

  const result = streamText({
    model: google('gemini-3.8-flash'),
    system: systemPrompt,
    messages: messages.slice(-15), // sliding window: last 15 messages
    onFinish: async ({ text }) => {
      // Persist the AI response to Supabase
      await supabase.from('chat_history').insert({
        project_id: projectId,
        role: 'assistant',
        content: text,
      })
    },
  })

  return result.toTextStreamResponse()
}
