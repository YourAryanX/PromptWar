import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DocsClient from './page-client'

export default async function DocsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/login')
  const user = session.user

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return <DocsClient project={project} />
}
