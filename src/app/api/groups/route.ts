import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/groups - list user's groups
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: memberRows } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const groupIds = memberRows?.map(r => r.group_id) ?? []
  if (groupIds.length === 0) return NextResponse.json([])

  const { data: groups, error } = await supabase
    .from('groups')
    .select(`
      *,
      creator:profiles!groups_created_by_fkey(id, name, email),
      group_members(id, user_id, profile:profiles(id, name, email))
    `)
    .in('id', groupIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(groups)
}

// POST /api/groups - create a group
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, memberIds = [] } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name: name.trim(), created_by: user.id })
    .select()
    .single()

  if (error || !group) return NextResponse.json({ error: error?.message }, { status: 500 })

  const rows = [
    { group_id: group.id, user_id: user.id },
    ...memberIds.map((id: string) => ({ group_id: group.id, user_id: id })),
  ]
  await supabase.from('group_members').insert(rows)

  return NextResponse.json(group, { status: 201 })
}
