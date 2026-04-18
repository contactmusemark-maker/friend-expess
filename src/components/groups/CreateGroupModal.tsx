'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2, Users } from 'lucide-react'

export default function CreateGroupModal({ currentUserId }: { currentUserId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [members, setMembers] = useState<{ id: string; name: string; email: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return
    setAdding(true)
    setError('')

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('email', memberEmail.trim())
      .single()

    if (!profile) {
      setError('No user found with that email.')
    } else if (profile.id === currentUserId) {
      setError('You are already the group creator.')
    } else if (members.find(m => m.id === profile.id)) {
      setError('Already added.')
    } else {
      setMembers(prev => [...prev, profile])
      setMemberEmail('')
    }
    setAdding(false)
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError('')

    // Create group
    const { data: group, error: groupErr } = await supabase
      .from('groups')
      .insert({ name: name.trim(), created_by: currentUserId })
      .select()
      .single()

    if (groupErr || !group) {
      setError(groupErr?.message ?? 'Failed to create group')
      setLoading(false)
      return
    }

    // Add creator + members
    const rows = [
      { group_id: group.id, user_id: currentUserId },
      ...members.map(m => ({ group_id: group.id, user_id: m.id })),
    ]
    await supabase.from('group_members').insert(rows)

    setOpen(false)
    setName('')
    setMembers([])
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-background font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
      >
        <Plus className="w-4 h-4" /> New Group
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="font-semibold text-foreground">Create Group</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Group name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Group Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Weekend Trip, Roommates"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                />
              </div>

              {/* Add members */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Add Members by Email</label>
                <div className="flex gap-2">
                  <input
                    value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                    placeholder="friend@email.com"
                    className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  />
                  <button
                    onClick={handleAddMember}
                    disabled={adding}
                    className="px-3.5 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-foreground transition-colors"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Member chips */}
              {members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {members.map(m => (
                    <span key={m.id} className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full">
                      {m.name ?? m.email}
                      <button onClick={() => setMembers(prev => prev.filter(x => x.id !== m.id))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-2.5">{error}</p>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-background font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
