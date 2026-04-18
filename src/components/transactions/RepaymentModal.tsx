'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

interface Props {
  transaction: Transaction
  onClose: () => void
}

export default function RepaymentModal({ transaction: t, onClose }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const maxRepay = Number(t.remaining_amount)

  const handleRepay = async () => {
    const amt = Number(amount)
    if (!amt || amt <= 0 || amt > maxRepay) {
      setError(`Amount must be between ₹1 and ${formatCurrency(maxRepay)}`)
      return
    }
    setLoading(true)
    setError('')

    // Insert repayment
    const { error: repErr } = await supabase.from('repayments').insert({
      transaction_id: t.id,
      amount_paid: amt,
    })
    if (repErr) { setError(repErr.message); setLoading(false); return }

    // Update transaction
    const newRemaining = maxRepay - amt
    const newStatus = newRemaining <= 0 ? 'completed' : 'partial'
    await supabase
      .from('transactions')
      .update({ remaining_amount: Math.max(0, newRemaining), status: newStatus })
      .eq('id', t.id)

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      onClose()
      router.refresh()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <h2 className="font-semibold text-foreground">Record Repayment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-foreground">Repayment recorded!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Transaction summary */}
              <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original amount</span>
                  <span className="text-foreground font-medium">{formatCurrency(Number(t.amount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Already paid</span>
                  <span className="text-emerald-400 font-medium">
                    {formatCurrency(Number(t.amount) - maxRepay)}
                  </span>
                </div>
                <div className="h-px bg-border/60 my-1" />
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="text-rose-400">{formatCurrency(maxRepay)}</span>
                </div>
                {t.note && <p className="text-xs text-muted-foreground mt-1">"{t.note}"</p>}
                <p className="text-xs text-muted-foreground">{formatDate(t.created_at)}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Repayment Amount (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max={maxRepay}
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  />
                  <button
                    onClick={() => setAmount(String(maxRepay))}
                    className="px-4 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
                  >
                    Full
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-2.5">{error}</p>
              )}

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleRepay}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-background font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
