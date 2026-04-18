'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction } from '@/types'

export function useTransactions(userId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchTransactions() {
      const { data } = await supabase
        .from('transactions')
        .select(`
          *,
          from_profile:profiles!transactions_from_user_fkey(id, name, email),
          to_profile:profiles!transactions_to_user_fkey(id, name, email),
          group:groups(id, name)
        `)
        .or(`from_user.eq.${userId},to_user.eq.${userId}`)
        .order('created_at', { ascending: false })
      setTransactions(data ?? [])
      setLoading(false)
    }

    fetchTransactions()

    // Real-time subscription
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { transactions, loading }
}
