import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupList from '@/components/groups/GroupList'
import CreateGroupModal from '@/components/groups/CreateGroupModal'

export default async function GroupsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: memberRows } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const groupIds = memberRows?.map(r => r.group_id) ?? []

  let groups: any[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('groups')
      .select(`
        *,
        creator:profiles!groups_created_by_fkey(id, name, email),
        group_members(id, user_id, profile:profiles(id, name, email))
      `)
      .in('id', groupIds)
      .order('created_at', { ascending: false })
    groups = data ?? []
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your expense groups</p>
        </div>
        <CreateGroupModal currentUserId={user.id} />
      </div>
      <GroupList groups={groups} currentUserId={user.id} />
    </div>
  )
}
