'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCcw, WandSparkles } from 'lucide-react'
import { createProject } from '@/app/actions/projects'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'

interface ProjectIdea {
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  techStack: string[]
  whyItFits: string
  wowFactor: string
}

interface Props {
  skills: string[]
  interests: string
}

export default function IdeasClientPage({ skills, interests }: Props) {
  const [loading, setLoading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [ideas, setIdeas] = useState<ProjectIdea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null)
  const [showRealityCheck, setShowRealityCheck] = useState(false)
  const [refiningIdea, setRefiningIdea] = useState<ProjectIdea | null>(null)
  const [refineFeedback, setRefineFeedback] = useState('')
  const [refineLoading, setRefineLoading] = useState(false)
  const router = useRouter()

  const generateIdeas = async () => {
    setLoading(true)
    setIdeas([])
    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, interests }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate ideas')
      }
      
      if (data.projects) {
        setIdeas(data.projects)
        toast.success("Ideas generated successfully!")
      } else {
        throw new Error('Invalid response from AI')
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to generate ideas. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (idea: ProjectIdea) => {
    setSelectedIdea(idea)
    setShowRealityCheck(true)
  }

  const handleConfirmProject = async () => {
    if (!selectedIdea) return
    setCommitting(true)
    try {
      const res = await createProject(
        selectedIdea.title,
        selectedIdea.description,
        selectedIdea.techStack,
        selectedIdea.difficulty,
        selectedIdea.wowFactor
      )
      if (res.error) {
        toast.error(res.error)
        setCommitting(false)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project.")
      setCommitting(false)
    }
  }

  const handleRefineIdea = async (idea: ProjectIdea) => {
    if (!refineFeedback.trim()) {
      toast.error('Please enter your feedback first.')
      return
    }
    setRefineLoading(true)
    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          interests,
          refineContext: `Original idea: "${idea.title}" - ${idea.description}. User feedback: ${refineFeedback}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to refine idea')
      if (data.projects?.length) {
        // Replace just this one idea in the list
        setIdeas(prev => prev.map(i => i.title === idea.title ? data.projects[0] : i))
        toast.success('Idea refined!')
        setRefiningIdea(null)
        setRefineFeedback('')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Refinement failed')
    } finally {
      setRefineLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-12 relative overflow-hidden flex flex-col items-center">
      {/* Background Blobs */}
      <div 
        className="fixed top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"
      />
      <div 
        className="fixed bottom-0 left-0 w-[25rem] h-[25rem] bg-rose-500/10 rounded-full blur-3xl -z-10 pointer-events-none"
      />

      <div className="w-full max-w-6xl z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-glow">
            Capstone Idea Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Based on your skill matrix, our AI will craft 3 unique, realistic, and highly-impressive project concepts.
          </p>
          
          {ideas.length === 0 && !loading && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
              <Button 
                onClick={generateIdeas}
                size="lg"
                aria-label="Generate project ideas based on your skills"
                className="rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.6)] px-8 py-6 text-lg font-semibold"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Generate My Ideas
              </Button>
            </motion.div>
          )}
          {ideas.length > 0 && !loading && !showRealityCheck && (
            <Button 
              onClick={generateIdeas} 
              variant="ghost" 
              className="mt-6 rounded-full text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
          )}
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <motion.p 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-lg font-medium text-foreground/80"
            >
              Analyzing your skills & brainstorming...
            </motion.p>
          </div>
        )}

        {/* Ideas Grid */}
        <AnimatePresence>
          {!showRealityCheck && ideas.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {ideas.map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, type: 'spring', stiffness: 100 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col glass-card border-white/20 bg-white/40 dark:bg-black/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={idea.difficulty === 'Hard' ? 'destructive' : idea.difficulty === 'Medium' ? 'default' : 'secondary'} className="rounded-full">
                          {idea.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold leading-tight group-hover:text-glow transition-all">
                        {idea.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-1 space-y-4">
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {idea.description}
                      </p>
                      
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tech Stack</span>
                        <div className="flex flex-wrap gap-2">
                          {idea.techStack.map(tech => (
                            <span key={tech} className="text-xs px-2 py-1 bg-white/20 dark:bg-white/10 rounded-md border border-white/10 backdrop-blur-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1 text-primary">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm font-semibold">Wow Factor</span>
                        </div>
                        <p className="text-xs text-foreground/70">{idea.wowFactor}</p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-4 border-t border-white/10 mt-auto flex gap-2">
                      <Button 
                        onClick={() => setRefiningIdea(refiningIdea?.title === idea.title ? null : idea)}
                        variant="outline"
                        size="sm"
                        aria-label={`Refine idea: ${idea.title}`}
                        className="rounded-xl flex-1 border-white/20 hover:bg-white/10"
                      >
                        <WandSparkles className="w-3.5 h-3.5 mr-1.5" /> Refine
                      </Button>
                      <Button 
                        onClick={() => handleSelect(idea)}
                        size="sm"
                        aria-label={`Select idea: ${idea.title}`}
                        className="rounded-xl flex-1 glass bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 text-foreground transition-all"
                      >
                        Select <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>

                    {/* Inline Refine Panel */}
                    {refiningIdea?.title === idea.title && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6 space-y-2 overflow-hidden"
                      >
                        <Textarea
                          autoFocus
                          value={refineFeedback}
                          onChange={e => setRefineFeedback(e.target.value)}
                          placeholder="e.g. Make it more focused on machine learning, remove the mobile app component..."
                          aria-label="Refinement feedback"
                          className="bg-black/10 dark:bg-black/30 border-white/10 text-sm rounded-xl resize-none h-20"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRefineIdea(idea)}
                          disabled={refineLoading}
                          className="w-full rounded-xl text-xs"
                        >
                          {refineLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <WandSparkles className="w-3 h-3 mr-1" />}
                          Apply Refinement
                        </Button>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reality Check View */}
        <AnimatePresence>
          {showRealityCheck && selectedIdea && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              className="max-w-3xl mx-auto"
            >
              <div className="glass-panel rounded-3xl p-8 border-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-primary to-blue-500 opacity-80" />
                
                <Button variant="ghost" onClick={() => setShowRealityCheck(false)} className="mb-6 rounded-full text-muted-foreground hover:text-foreground">
                  ← Back to Ideas
                </Button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Reality Check Passed</h2>
                    <p className="text-sm text-muted-foreground">This project is feasible for a 4-month timeline.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">{selectedIdea.title}</h3>
                    <p className="text-lg text-foreground/80">{selectedIdea.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-white/10">
                      <h4 className="font-semibold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary"/> Why you can build it</h4>
                      <p className="text-sm text-muted-foreground">{selectedIdea.whyItFits}</p>
                    </div>
                    <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-amber-900 dark:text-amber-200">
                      <h4 className="font-semibold mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Challenges</h4>
                      <p className="text-sm opacity-90">Learning curve with {selectedIdea.techStack.join(', ')}. Requires consistent weekly effort.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
                  <motion.div whileHover={{ scale: committing ? 1 : 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      onClick={handleConfirmProject}
                      disabled={committing}
                      className="rounded-xl px-8 bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    >
                      {committing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving Project...</>
                      ) : (
                        <>Commit & Build Roadmap<ArrowRight className="w-5 h-5 ml-2" /></>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
