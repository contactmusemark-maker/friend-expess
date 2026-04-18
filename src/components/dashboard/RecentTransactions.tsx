import Link from 'next/link'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { Transaction } from '@/types'
import { ArrowUpRight } from 'lucide-react'

interface Props {
  transactions: Transaction[]
  currentUserId: string
}

const statusClass: Record<string, string> = {
  pending: 'badge-pending',
  partial: 'badge-partial',
  completed: 'badge-completed',
}

export default function RecentTransactions({ transactions, currentUserId }: Props) {
  return (
    <div className="glass-card rounded-2xl border border-border/60">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        <Link href="/transactions" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      {transactions.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">No transactions yet</div>
      ) : (
        <div className="divide-y divide-border/40">
          {transactions.map((t) => {
            const isLender = t.from_user === currentUserId
            const other = isLender ? t.to_profile : t.from_profile
            return (
              <div key={t.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-secondary/20 transition-colors">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                  {getInitials(other?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {isLender ? `You lent ${other?.name ?? 'someone'}` : `${other?.name ?? 'Someone'} lent you`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{t.note || t.group?.name || '—'} · {formatDate(t.created_at)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${isLender ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isLender ? '+' : '-'}{formatCurrency(Number(t.amount))}
                  </p>
                  <span className={statusClass[t.status] ?? 'badge'}>
                    {t.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
