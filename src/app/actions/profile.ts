'use server'

import { createClient } from '@/utils/supabase/server'
import { profileSchema } from '@/lib/validations'

export async function upsertProfile(name: string, skills: string[], interests: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Unauthorized' }
    }

    const validatedData = profileSchema.parse({ name, skills, interests })

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        name: validatedData.name, 
        skills: validatedData.skills, 
        interests: validatedData.interests, 
        updated_at: new Date().toISOString() 
      })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Validation failed' }
  }
}
