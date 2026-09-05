'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { signOut } from '@/app/actions/auth'
import { LogOut, User, Bell, Shield, Key, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { upsertProfile } from '@/app/actions/profile'
import { updateProjectDeadline } from '@/app/actions/projects'

export default function SettingsClient({ profile, email, project }: { profile: { name: string; skills: string[]; interests: string }, email: string, project: { id: string; submission_date: string | null } | null }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [interests, setInterests] = useState(profile?.interests || '')
  const [deadline, setDeadline] = useState(project?.submission_date || '')

  const handleSave = async () => {
    setLoading(true)
    try {
      await upsertProfile(name, profile?.skills || [], interests)
      
      if (project?.id && deadline) {
        await updateProjectDeadline(project.id, deadline)
      }
      
      toast.success("Settings updated successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Settings Sidebar Nav */}
        <div className="col-span-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start font-semibold bg-white/5">
            <User className="w-4 h-4 mr-2" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Shield className="w-4 h-4 mr-2" /> Security
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Key className="w-4 h-4 mr-2" /> API Keys
          </Button>
        </div>

        {/* Main Settings Area */}
        <div className="col-span-1 md:col-span-3 space-y-8">
          
          <div className="glass-panel p-8 rounded-3xl border-white/10 space-y-6">
            <h2 className="text-xl font-bold">Personal Information</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/20 border-white/10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  value={email} 
                  disabled 
                  className="bg-black/20 border-white/10 opacity-50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Interests</label>
              <Input 
                value={interests} 
                onChange={(e) => setInterests(e.target.value)}
                className="bg-black/20 border-white/10" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Skills</label>
              <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-black/20 border border-white/5">
                {profile?.skills?.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="bg-primary/20 border-primary/30 text-primary-foreground">
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Skills cannot be changed after onboarding to preserve your project alignment.</p>
            </div>

            {project && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-rose-400">Project Submission Deadline</label>
                <Input 
                  type="date"
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-black/20 border-white/10 w-full md:w-1/2" 
                />
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8 bg-primary">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-red-500/20 bg-red-500/5 space-y-4">
            <h2 className="text-xl font-bold text-red-500">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Signing out will end your current session. You will need to re-authenticate to access your projects and AI mentor.
            </p>
            <Button 
              variant="destructive" 
              className="rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out Securely
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
