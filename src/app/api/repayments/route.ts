import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { transaction_id, amount_paid } = body

  if (!transaction_id || !amount_paid || amount_paid <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Fetch transaction
  const { data: txn, error: txnErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transaction_id)
    .single()

  if (txnErr || !txn) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  if (txn.from_user !== user.id && txn.to_user !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (amount_paid > txn.remaining_amount) {
    return NextResponse.json({ error: 'Amount exceeds remaining balance' }, { status: 400 })
  }

  // Insert repayment
  const { error: repErr } = await supabase.from('repayments').insert({
    transaction_id,
    amount_paid,
  })

  if (repErr) {
    return NextResponse.json({ error: repErr.message }, { status: 500 })
  }

  // Update transaction
  const newRemaining = Number(txn.remaining_amount) - amount_paid
  const newStatus = newRemaining <= 0 ? 'completed' : 'partial'

  const { error: updateErr } = await supabase
    .from('transactions')
    .update({ remaining_amount: Math.max(0, newRemaining), status: newStatus })
    .eq('id', transaction_id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, remaining: newRemaining, status: newStatus })
}
