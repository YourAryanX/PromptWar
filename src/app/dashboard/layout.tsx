'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, MessageSquare, FileText, Settings, Sparkles } from 'lucide-react'

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kanban Board', href: '/dashboard/kanban', icon: CheckSquare },
  { name: 'AI Mentor', href: '/dashboard/mentor', icon: MessageSquare },
  { name: 'Documents', href: '/dashboard/docs', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden text-foreground">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 p-6 flex flex-col glass border-r border-white/10 relative z-20">
        <div className="mb-10 px-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight text-glow">PromptWar</h2>
        </div>

        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <div className={`relative px-4 py-3 rounded-xl flex items-center gap-3 transition-colors duration-200 cursor-pointer ${isActive ? 'text-primary-foreground font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5'}`}>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto p-4 glass-panel rounded-2xl border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              ST
            </div>
            <div>
              <p className="text-sm font-medium">Student</p>
              <p className="text-xs text-muted-foreground">Free Tier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="p-8 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
