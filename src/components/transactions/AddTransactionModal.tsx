'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2, ArrowLeftRight } from 'lucide-react'
import type { Profile } from '@/types'

interface Props {
  groupId: string
  members: Profile[]
  currentUserId: string
}

export default function AddTransactionModal({ groupId, members, currentUserId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [toUser, setToUser] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const otherMembers = members.filter(m => m.id !== currentUserId)

  const handleSubmit = async () => {
    if (!toUser || !amount || Number(amount) <= 0) {
      setError('Please fill in all fields correctly.')
      return
    }
    setLoading(true)
    setError('')

    const amt = Number(amount)
    const { error: err } = await supabase.from('transactions').insert({
      group_id: groupId,
      from_user: currentUserId,
      to_user: toUser,
      amount: amt,
      remaining_amount: amt,
      note: note.trim() || null,
      status: 'pending',
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setOpen(false)
    setToUser('')
    setAmount('')
    setNote('')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-background font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
      >
        <Plus className="w-4 h-4" /> Add Transaction
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="font-semibold text-foreground">Add Transaction</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Lend money to</label>
                <select
                  value={toUser}
                  onChange={e => setToUser(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                >
                  <option value="">Select a member</option>
                  {otherMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Note (optional)</label>
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Dinner, cab, groceries..."
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-2.5">{error}</p>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-background font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
