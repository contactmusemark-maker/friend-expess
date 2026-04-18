import { getInitials, formatCurrency } from '@/lib/utils'
import type { FriendBalance } from '@/types'

export default function FriendBalances({ balances }: { balances: FriendBalance[] }) {
  return (
    <div className="glass-card rounded-2xl p-5 h-full border border-border/60">
      <h3 className="font-semibold text-foreground mb-4">Friend Balances</h3>
      {balances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/60 flex items-center justify-center mb-3">
            <span className="text-xl">🤝</span>
          </div>
          <p className="text-muted-foreground text-sm">All settled up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {balances.map(({ profile, balance }) => (
            <div key={profile.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                {getInitials(profile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{profile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {balance > 0 ? 'owes you' : 'you owe'}
                </p>
              </div>
              <span className={`text-sm font-semibold ${balance > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {balance > 0 ? '+' : '-'}{formatCurrency(Math.abs(balance))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
