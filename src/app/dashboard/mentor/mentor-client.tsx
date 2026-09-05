'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  projectId: string
  projectTitle: string
  techStack: string[]
  initialMessages: Message[]
}

export default function MentorClient({ projectId, projectTitle, techStack, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    // Placeholder for streaming AI response
    const assistantId = (Date.now() + 1).toString()
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          projectId,
          projectTitle,
          techStack,
        }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        )
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col max-h-[85vh]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow mb-1">AI Mentor</h1>
          <p className="text-muted-foreground text-sm">Always available to help you unblock</p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border-primary/30">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary truncate max-w-[200px]">{projectTitle}</span>
        </div>
      </motion.div>

      <div className="flex-1 glass rounded-3xl border-white/10 overflow-hidden flex flex-col shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 space-y-4 text-center opacity-50">
              <Bot className="w-12 h-12 text-primary" />
              <p className="text-sm">Your AI Mentor is ready. Ask anything about your project!</p>
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary border border-primary/30 mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed backdrop-blur-md shadow-lg whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-white/60 dark:bg-zinc-900/60 border border-white/20 rounded-tl-sm'
                }`}>
                  {msg.content || <span className="opacity-50 italic">Thinking...</span>}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20 mt-1">
                    <User className="w-5 h-5 text-foreground/80" />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white/40 dark:bg-zinc-900/40 rounded-2xl p-4 rounded-tl-sm flex items-center gap-1 border border-white/10">
                  <motion.div className="w-2 h-2 rounded-full bg-primary/70" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-primary/70" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-primary/70" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your project..."
              className="flex-1 rounded-full h-14 bg-white/50 dark:bg-zinc-900/50 border-white/20 pl-6 pr-14 focus-visible:ring-primary shadow-inner"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-2 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-90"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


