'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { upsertProfile } from '@/app/actions/profile'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#',
  'React', 'Next.js', 'Node.js', 'Django', 'Flask', 'Spring Boot',
  'SQL', 'MongoDB', 'PostgreSQL', 'Firebase', 'Supabase',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP',
  'AWS', 'Docker', 'Kubernetes', 'Git'
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  
  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      if (!interests.trim()) {
        toast.error("Please enter your interests so we can tailor your ideas!")
        return
      }
      setSaving(true)
      try {
        const res = await upsertProfile(name, skills, interests)
        if (res.error) {
          toast.error(res.error)
          setSaving(false)
        } else {
          router.push('/ideas')
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to save profile.")
        setSaving(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Blobs for Glassmorphism */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-[10%] -left-[10%] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl -z-10 will-change-transform"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 25, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[10%] -right-[10%] w-[25rem] h-[25rem] bg-pink-500/20 rounded-full blur-3xl -z-10 will-change-transform"
      />

      <div className="w-full max-w-2xl relative">
        <motion.div layout className="glass-panel rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-glow">
              {step === 1 ? 'Welcome to PromptWar' : step === 2 ? 'Your Skill Matrix' : 'Your Interests'}
            </h1>
            <div className="text-sm font-medium text-muted-foreground bg-white/10 dark:bg-black/20 px-3 py-1 rounded-full border border-white/10">
              Step {step} of 3
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium ml-1">What should we call you?</label>
                  <Input 
                    placeholder="Your Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 dark:bg-black/10 border-white/20 h-14 rounded-xl text-lg focus-visible:ring-primary/50"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <p className="text-muted-foreground text-sm">
                  Select the technologies you already know. We'll use these to suggest realistic capstone projects.
                </p>
                <div className="flex flex-wrap gap-3">
                  {SKILL_OPTIONS.map((skill) => {
                    const isSelected = skills.includes(skill)
                    return (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={skill}>
                        <Badge
                          onClick={() => toggleSkill(skill)}
                          variant="outline"
                          role="checkbox"
                          aria-checked={isSelected}
                          className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border-white/20 backdrop-blur-md ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' 
                              : 'bg-white/5 hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/40'
                          }`}
                        >
                          {skill}
                        </Badge>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium ml-1">What domains or topics interest you?</label>
                  <p className="text-muted-foreground text-xs ml-1 mb-2">
                    E.g., "Healthcare and AI", "Fintech apps", "Web3 and block chain", "Sustainability".
                  </p>
                  <Input 
                    placeholder="E.g. AI-powered education tools" 
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNext()
                    }}
                    className="bg-white/10 dark:bg-black/10 border-white/20 h-14 rounded-xl text-lg focus-visible:ring-primary/50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex justify-between items-center">
            <Button
              variant="ghost"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="rounded-xl px-6"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={(step === 1 && !name) || saving}
              className="rounded-xl px-8 h-12 bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : step === 3 ? 'Save & Generate Ideas' : 'Continue'}
            </Button>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
