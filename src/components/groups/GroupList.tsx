import Link from 'next/link'
import { formatDate, getInitials } from '@/lib/utils'
import { Users, ArrowRight, Crown } from 'lucide-react'
import type { Group } from '@/types'

interface Props {
  groups: (Group & { group_members: any[] })[]
  currentUserId: string
}

export default function GroupList({ groups, currentUserId }: Props) {
  if (groups.length === 0) {
    return (
      <div className="glass-card rounded-2xl border border-border/60 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No groups yet</h3>
        <p className="text-muted-foreground text-sm">Create a group and start tracking expenses with friends.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {groups.map((group, i) => {
        const memberCount = group.group_members?.length ?? 0
        const isCreator = group.created_by === currentUserId
        const members = group.group_members?.slice(0, 4) ?? []

        return (
          <div
            key={group.id}
            className="glass-card rounded-2xl border border-border/60 p-5 hover:border-emerald-500/25 transition-all duration-200 group"
            style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.06}s forwards`, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              {isCreator && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full">
                  <Crown className="w-3 h-3" /> Creator
                </span>
              )}
            </div>

            {/* Name & date */}
            <h3 className="font-semibold text-foreground mb-0.5">{group.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">Created {formatDate(group.created_at)}</p>

            {/* Member avatars */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {members.map((m: any) => (
                  <div
                    key={m.id}
                    title={m.profile?.name}
                    className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-bold text-muted-foreground"
                  >
                    {getInitials(m.profile?.name)}
                  </div>
                ))}
                {memberCount > 4 && (
                  <div className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-bold text-muted-foreground">
                    +{memberCount - 4}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            </div>

            {/* Link */}
            <Link
              href={`/groups/${group.id}`}
              className="flex items-center justify-between w-full text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View group <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )
      })}
    </div>
  )
}
