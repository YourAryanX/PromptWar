import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './page-client'

export const metadata: Metadata = {
  title: 'Settings — PromptWar',
  description: 'Manage your profile, skills, and project settings.',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/login')
  const user = session.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: project } = await supabase
    .from('projects')
    .select('id, submission_date')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return <SettingsClient profile={profile} email={user.email || ''} project={project} />
}
