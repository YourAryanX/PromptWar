'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function upsertProfile(name: string, skills: string[]) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, name, skills, updated_at: new Date().toISOString() })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/ideas')
}
