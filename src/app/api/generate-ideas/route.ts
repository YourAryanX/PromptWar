import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import rateLimit from '@/lib/rate-limit';

export const maxDuration = 60;

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await limiter.check(10, user.id);
    } catch {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Fetch skills and interests from the database instead of trusting the client
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, interests')
      .eq('id', user.id)
      .single();

    const skills = profile?.skills || [];
    const interests = profile?.interests || '';

    const { object } = await generateObject({
      model: google('gemini-3.8-flash'),
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
      The student has the following skills: ${skills.join(', ') || 'None provided'}.
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
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
