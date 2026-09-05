import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Note: Ensure GOOGLE_GENERATIVE_AI_API_KEY is set in .env.local
export async function POST(req: Request) {
  try {
    const { skills, interests } = await req.json();

    const { object } = await generateObject({
      model: google('gemini-3.1-flash'),
      schema: z.object({
        projects: z.array(
          z.object({
            title: z.string().describe('Catchy, professional title of the project'),
            description: z.string().describe('A 2-3 sentence overview of what it does'),
            difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('Estimated difficulty for a final-year student'),
            techStack: z.array(z.string()).describe('List of 3-5 core technologies (frameworks/DBs/languages)'),
            whyItFits: z.string().describe('Why this matches the student skills perfectly'),
            wowFactor: z.string().describe('What makes this stand out in a viva/resume'),
          })
        ).length(3).describe('Exactly 3 project ideas'),
      }),
      prompt: `You are an expert capstone project mentor for final year engineering students.
      The student has the following skills: ${skills?.join(', ') || 'None provided'}.
      They are interested in: ${interests || 'General software engineering'}.
      
      Generate exactly 3 project ideas that:
      1. Are realistic to build solo in 3-4 months.
      2. Use their existing skills but push them slightly out of their comfort zone.
      3. Are NOT generic (no simple library management systems, no basic to-do apps).
      4. Have a clear "Wow factor" for examiners.
      `,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 });
  }
}
