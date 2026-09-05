import { createClient } from '@/utils/supabase/server'
import DashboardShell from './dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName = 'Student'
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    
    if (data?.name) {
      userName = data.name
    }
  }

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>

      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[25rem] h-[25rem] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Sidebar */}
      <DashboardShell userName={userName} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 overflow-y-auto relative z-10">
        <div className="p-8 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
