'use client'

import { useState } from 'react'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { Transaction } from '@/types'
import { Search, Filter } from 'lucide-react'
import RepaymentModal from './RepaymentModal'

interface Props {
  transactions: Transaction[]
  currentUserId: string
}

const statusClass: Record<string, string> = {
  pending: 'badge-pending',
  partial: 'badge-partial',
  completed: 'badge-completed',
}

export default function TransactionTable({ transactions, currentUserId }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'lent' | 'borrowed' | 'pending' | 'completed'>('all')
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)

  const filtered = transactions.filter((t) => {
    const other = t.from_user === currentUserId ? t.to_profile : t.from_profile
    const matchSearch =
      !search ||
      other?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.note?.toLowerCase().includes(search.toLowerCase()) ||
      (t as any).group?.name?.toLowerCase().includes(search.toLowerCase())

    const matchFilter =
      filter === 'all' ||
      (filter === 'lent' && t.from_user === currentUserId) ||
      (filter === 'borrowed' && t.to_user === currentUserId) ||
      (filter === 'pending' && (t.status === 'pending' || t.status === 'partial')) ||
      (filter === 'completed' && t.status === 'completed')

    return matchSearch && matchFilter
  })

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, note, or group..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(['all', 'lent', 'borrowed', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-border/60 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Person</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Note</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Group</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((t) => {
                  const isLender = t.from_user === currentUserId
                  const other = isLender ? t.to_profile : t.from_profile
                  return (
                    <tr
                      key={t.id}
                      onClick={() => t.status !== 'completed' && setSelectedTxn(t)}
                      className={`hover:bg-secondary/20 transition-colors ${t.status !== 'completed' ? 'cursor-pointer' : ''}`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                            {getInitials(other?.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{other?.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{isLender ? 'You lent' : 'You borrowed'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm text-muted-foreground max-w-[140px] truncate">{t.note ?? '—'}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm text-muted-foreground">{(t as any).group?.name ?? '—'}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(t.created_at)}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={statusClass[t.status] ?? 'badge'}>{t.status}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={`text-sm font-semibold ${isLender ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isLender ? '+' : '-'}{formatCurrency(Number(t.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-sm text-muted-foreground">{formatCurrency(Number(t.remaining_amount))}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTxn && (
        <RepaymentModal transaction={selectedTxn} onClose={() => setSelectedTxn(null)} />
      )}
    </>
  )
}
