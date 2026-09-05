'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, Download, CheckCircle, FileOutput } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

export default function DocsClient({ project }: { project: { id: string; title: string } | null }) {
  const [loading, setLoading] = useState(false)
  const [proposal, setProposal] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!project) return
    setLoading(true)
    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setProposal(data.proposal)
      toast.success('Project Proposal generated successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate proposal')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!proposal || !project) return
    const blob = new Blob([proposal], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title.replace(/\s+/g, '_')}_Proposal.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <FileOutput className="w-16 h-16 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-bold">No Active Project</h2>
        <p className="text-muted-foreground max-w-md">You need to select and commit to an idea before generating documentation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow">Project Documents</h1>
          <p className="text-muted-foreground">Auto-generate academic proposals and reports for submission.</p>
        </div>
        {proposal && (
          <Button onClick={handleDownload} variant="outline" className="glass bg-primary/10 text-primary border-primary/30 rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Download Markdown
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Document Types Sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border-primary/30 bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Project Proposal</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">A formal 1-page synopsis of objectives, scope, and tech stack.</p>
            {!proposal ? (
              <Button onClick={handleGenerate} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Generate Now'}
              </Button>
            ) : (
              <Button variant="outline" className="w-full border-green-500/30 text-green-500 hover:bg-green-500/10 rounded-xl">
                <CheckCircle className="w-4 h-4 mr-2" /> Generated
              </Button>
            )}
          </div>

          <div className="glass-panel p-4 rounded-2xl border-white/5 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Final Report (Draft)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Full thesis documentation based on your completed Kanban tasks.</p>
            <Button disabled variant="outline" className="w-full rounded-xl">Available near completion</Button>
          </div>
        </div>

        {/* Document Editor/Viewer Area */}
        <div className="col-span-1 lg:col-span-3">
          <div className="glass-panel rounded-3xl min-h-[600px] border-white/10 relative overflow-hidden flex flex-col">
            
            {/* Mock toolbar */}
            <div className="h-12 border-b border-white/10 bg-black/20 flex items-center px-4 gap-4 text-muted-foreground text-sm">
              <span className="font-medium text-foreground">{project.title} - Proposal.md</span>
              <div className="w-[1px] h-4 bg-white/10" />
              <span>Markdown</span>
              <span>UTF-8</span>
            </div>

            <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-p:text-zinc-300 prose-headings:text-zinc-100 max-w-none">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p>AI is drafting your proposal... this takes about 10 seconds.</p>
                </div>
              ) : proposal ? (
                <ReactMarkdown>{proposal}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 space-y-4">
                  <FileText className="w-16 h-16" />
                  <p>Click &quot;Generate Now&quot; to let AI write your project proposal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
