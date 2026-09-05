'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // In a real app we'd send magic link, here we'll simulate or use standard auth
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div 
        className="absolute top-[20%] left-[20%] w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"
      />
      <div 
        className="absolute bottom-[20%] right-[20%] w-[25rem] h-[25rem] bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow">PromptWar</h1>
            <p className="text-muted-foreground">Your AI Capstone Mentor</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium ml-1 text-foreground/80">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="student@college.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 dark:bg-black/10 border-white/20 h-12 rounded-xl focus-visible:ring-primary/50"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 font-medium text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue with Email'}
            </Button>
          </form>

          {message && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-sm font-medium text-primary"
            >
              {message}
            </motion.p>
          )}

          <div className="mt-8 flex items-center justify-between">
            <div className="w-full h-[1px] bg-border" />
            <span className="px-4 text-xs text-muted-foreground uppercase tracking-widest font-semibold">Or</span>
            <div className="w-full h-[1px] bg-border" />
          </div>

          <Button 
            variant="outline" 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full mt-6 h-12 rounded-xl bg-white/5 dark:bg-black/20 hover:bg-white/10 dark:hover:bg-black/40 border-white/10 transition-all active:scale-95 backdrop-blur-md"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

        </div>
      </motion.div>
    </div>
  )
}
