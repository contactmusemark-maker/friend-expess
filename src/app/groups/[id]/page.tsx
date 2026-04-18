import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatDate, getInitials } from '@/lib/utils'
import { Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import GroupTransactions from '@/components/groups/GroupTransactions'
import AddTransactionModal from '@/components/transactions/AddTransactionModal'

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: group } = await supabase
    .from('groups')
    .select(`
      *,
      creator:profiles!groups_created_by_fkey(id, name, email),
      group_members(id, user_id, profile:profiles(id, name, email))
    `)
    .eq('id', params.id)
    .single()

  if (!group) notFound()

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      from_profile:profiles!transactions_from_user_fkey(id, name, email),
      to_profile:profiles!transactions_to_user_fkey(id, name, email)
    `)
    .eq('group_id', params.id)
    .order('created_at', { ascending: false })

  const members = group.group_members?.map((m: any) => m.profile).filter(Boolean) ?? []

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back */}
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Groups
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
            <p className="text-muted-foreground text-sm">Created {formatDate(group.created_at)} · {members.length} members</p>
          </div>
        </div>
        <AddTransactionModal
          groupId={group.id}
          members={members}
          currentUserId={user.id}
        />
      </div>

      {/* Members strip */}
      <div className="glass-card rounded-2xl border border-border/60 p-5">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Members</h3>
        <div className="flex flex-wrap gap-3">
          {members.map((m: any) => (
            <div key={m.id} className="flex items-center gap-2.5 bg-secondary/50 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                {getInitials(m.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground leading-none">{m.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <GroupTransactions transactions={transactions ?? []} currentUserId={user.id} />
    </div>
  )
}
