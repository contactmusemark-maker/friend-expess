import { TrendingUp, TrendingDown, Scale, ArrowLeftRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatCardsProps {
  totalLent: number
  totalOwed: number
  netBalance: number
  txnCount: number
}

export default function StatCards({ totalLent, totalOwed, netBalance, txnCount }: StatCardsProps) {
  const cards = [
    {
      label: 'You Are Owed',
      value: formatCurrency(totalLent),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/8',
      border: 'border-emerald-400/15',
      glow: 'shadow-emerald-500/5',
      sub: 'money lent to friends',
    },
    {
      label: 'You Owe',
      value: formatCurrency(totalOwed),
      icon: TrendingDown,
      color: 'text-rose-400',
      bg: 'bg-rose-400/8',
      border: 'border-rose-400/15',
      glow: 'shadow-rose-500/5',
      sub: 'money borrowed from friends',
    },
    {
      label: 'Net Balance',
      value: formatCurrency(Math.abs(netBalance)),
      icon: Scale,
      color: netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400',
      bg: netBalance >= 0 ? 'bg-emerald-400/8' : 'bg-rose-400/8',
      border: netBalance >= 0 ? 'border-emerald-400/15' : 'border-rose-400/15',
      glow: netBalance >= 0 ? 'shadow-emerald-500/5' : 'shadow-rose-500/5',
      sub: netBalance >= 0 ? 'overall surplus' : 'overall deficit',
    },
    {
      label: 'Transactions',
      value: txnCount.toString(),
      icon: ArrowLeftRight,
      color: 'text-sky-400',
      bg: 'bg-sky-400/8',
      border: 'border-sky-400/15',
      glow: 'shadow-sky-500/5',
      sub: 'total recorded',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`stat-card border ${card.border} shadow-xl ${card.glow} stagger-${i + 1}`}
            style={{ animationDelay: `${i * 0.07}s`, opacity: 0, animation: 'fadeInUp 0.4s ease-out forwards' }}
          >
            {/* Decorative top bar */}
            <div className={`absolute top-0 left-6 right-6 h-px ${card.bg.replace('/8', '/30')}`} />

            <div className={`inline-flex p-2.5 rounded-xl ${card.bg} border ${card.border} mb-4`}>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
