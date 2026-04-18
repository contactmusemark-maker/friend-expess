'use client'

import { useState } from 'react'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { Transaction } from '@/types'
import { ArrowLeftRight } from 'lucide-react'
import RepaymentModal from '@/components/transactions/RepaymentModal'

interface Props {
  transactions: Transaction[]
  currentUserId: string
}

const statusClass: Record<string, string> = {
  pending: 'badge-pending',
  partial: 'badge-partial',
  completed: 'badge-completed',
}

export default function GroupTransactions({ transactions, currentUserId }: Props) {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-2xl border border-border/60 py-16 text-center">
        <ArrowLeftRight className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No transactions yet. Add one above!</p>
      </div>
    )
  }

  return (
    <>
      <div className="glass-card rounded-2xl border border-border/60">
        <div className="px-6 py-4 border-b border-border/60">
          <h3 className="font-semibold text-foreground">Transactions</h3>
        </div>
        <div className="divide-y divide-border/40">
          {transactions.map((t) => {
            const isLender = t.from_user === currentUserId
            const other = isLender ? t.to_profile : t.from_profile
            const pct = t.amount > 0 ? ((Number(t.amount) - Number(t.remaining_amount)) / Number(t.amount)) * 100 : 0

            return (
              <div
                key={t.id}
                className="px-6 py-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                onClick={() => setSelectedTxn(t)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                    {getInitials(other?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">
                        {isLender ? `You → ${other?.name ?? '?'}` : `${other?.name ?? '?'} → You`}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={statusClass[t.status] ?? 'badge'}>{t.status}</span>
                        <span className={`text-sm font-semibold ${isLender ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(Number(t.amount))}
                        </span>
                      </div>
                    </div>
                    {t.note && <p className="text-xs text-muted-foreground truncate mb-2">{t.note}</p>}
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatCurrency(Number(t.remaining_amount))} left
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedTxn && (
        <RepaymentModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </>
  )
}
