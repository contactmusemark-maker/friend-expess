import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarView from '@/components/calendar/CalendarView'

export default async function CalendarPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground text-sm mt-0.5">View your transactions by date</p>
      </div>
      <CalendarView transactions={transactions ?? []} currentUserId={user.id} />
    </div>
  )
}
