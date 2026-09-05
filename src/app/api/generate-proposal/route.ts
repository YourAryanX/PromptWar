import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import rateLimit from '@/lib/rate-limit'

export const maxDuration = 60

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await limiter.check(10, user.id)
    } catch {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { projectId } = await req.json()

    // Fetch the project and tasks, ensuring ownership
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 })
    }

    const prompt = `You are a strict, formal academic writing assistant for engineering capstone projects. 
Write a comprehensive 1-page Project Proposal Document for the following project:

Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.tech_stack?.join(', ')}
Wow Factor: ${project.wow_factor}

The document MUST be formatted in Markdown.
It must include:
1. # Project Title
2. ## 1. Introduction and Problem Statement
3. ## 2. Proposed Solution & Objectives
4. ## 3. Technical Architecture & Stack
5. ## 4. Expected Outcomes & Impact

Write professionally. Make it sound highly academic and impressive for a university professor.`

    const { text } = await generateText({
      model: google('gemini-3.8-flash'),
      prompt,
    })

    return NextResponse.json({ proposal: text })
  } catch (error: any) {
    console.error('Error generating proposal:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate proposal' }, { status: 500 })
  }
}
