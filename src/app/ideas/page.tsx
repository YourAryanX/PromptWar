import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import IdeasClientPage from './page-client'

export default async function IdeasPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/login')
  const user = session.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('skills, interests')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return <IdeasClientPage skills={profile.skills || []} interests={profile.interests || ''} />
}
