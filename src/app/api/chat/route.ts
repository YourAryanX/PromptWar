import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@/utils/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, projectId, projectTitle, techStack } = await req.json()

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

The student's current capstone project is: "${projectTitle}"
Tech stack: ${techStack?.join(', ') || 'Not specified'}

Your role:
- Provide specific, actionable advice (not generic)
- Be honest and direct when ideas won't work
- Suggest concrete code snippets, architecture decisions, and debugging steps
- Remember you know their full project context
- Help them prepare for exams and viva questions
- Keep responses focused and structured — use bullet points and code blocks where helpful
- Never say "great question!" or use filler phrases
`

  const result = streamText({
    model: google('gemini-2.0-flash-exp'),
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
