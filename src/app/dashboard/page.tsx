import { createClient } from '@/lib/supabase/server'
import StatCards from '@/components/dashboard/StatCards'
import FriendBalances from '@/components/dashboard/FriendBalances'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import SpendingChart from '@/components/charts/SpendingChart'
import type { Transaction, Profile } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please <a href="/auth/login" className="text-emerald-400">sign in</a> to continue.</p>
      </div>
    )
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      from_profile:profiles!transactions_from_user_fkey(id, name, email),
      to_profile:profiles!transactions_to_user_fkey(id, name, email),
      group:groups(id, name)
    `)
    .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const txns = (transactions ?? []) as Transaction[]

  const totalLent = txns
    .filter(t => t.from_user === user.id && t.status !== 'completed')
    .reduce((sum, t) => sum + Number(t.remaining_amount), 0)

  const totalOwed = txns
    .filter(t => t.to_user === user.id && t.status !== 'completed')
    .reduce((sum, t) => sum + Number(t.remaining_amount), 0)

  const balanceMap = new Map<string, { profile: Profile; balance: number }>()
  for (const t of txns) {
    if (t.status === 'completed') continue
    if (t.from_user === user.id && t.to_profile) {
      const key = t.to_user
      const existing = balanceMap.get(key)
      balanceMap.set(key, { profile: t.to_profile, balance: (existing?.balance ?? 0) + Number(t.remaining_amount) })
    }
    if (t.to_user === user.id && t.from_profile) {
      const key = t.from_user
      const existing = balanceMap.get(key)
      balanceMap.set(key, { profile: t.from_profile, balance: (existing?.balance ?? 0) - Number(t.remaining_amount) })
    }
  }

  const friendBalances = Array.from(balanceMap.values())
  const chartData = buildChartData(txns, user.id)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your financial snapshot at a glance</p>
      </div>
      <StatCards totalLent={totalLent} totalOwed={totalOwed} netBalance={totalLent - totalOwed} txnCount={txns.length} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SpendingChart data={chartData} />
        </div>
        <div>
          <FriendBalances balances={friendBalances} />
        </div>
      </div>
      <RecentTransactions transactions={txns.slice(0, 8)} currentUserId={user.id} />
    </div>
  )
}

function buildChartData(txns: Transaction[], userId: string) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  return days.map(date => {
    const dayTxns = txns.filter(t => t.created_at.startsWith(date))
    return {
      date: new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      lent: dayTxns.filter(t => t.from_user === userId).reduce((s, t) => s + Number(t.amount), 0),
      borrowed: dayTxns.filter(t => t.to_user === userId).reduce((s, t) => s + Number(t.amount), 0),
    }
  })
}
