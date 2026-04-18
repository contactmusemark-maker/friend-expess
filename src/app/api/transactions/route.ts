import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/transactions
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      from_profile:profiles!transactions_from_user_fkey(id, name, email),
      to_profile:profiles!transactions_to_user_fkey(id, name, email),
      group:groups(id, name),
      repayments(id, amount_paid, created_at)
    `)
    .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/transactions
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { group_id, to_user, amount, note } = await request.json()

  if (!to_user || !amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'to_user and amount are required' }, { status: 400 })
  }

  const amt = Number(amount)
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      group_id: group_id ?? null,
      from_user: user.id,
      to_user,
      amount: amt,
      remaining_amount: amt,
      note: note?.trim() ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
