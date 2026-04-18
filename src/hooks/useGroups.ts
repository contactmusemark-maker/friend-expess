'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Group } from '@/types'

export function useGroups(userId: string) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchGroups() {
      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId)

      const groupIds = memberRows?.map((r) => r.group_id) ?? []
      if (groupIds.length === 0) { setLoading(false); return }

      const { data } = await supabase
        .from('groups')
        .select(`
          *,
          creator:profiles!groups_created_by_fkey(id, name, email),
          group_members(id, user_id, profile:profiles(id, name, email))
        `)
        .in('id', groupIds)
        .order('created_at', { ascending: false })

      setGroups(data ?? [])
      setLoading(false)
    }

    fetchGroups()
  }, [userId])

  return { groups, loading }
}
