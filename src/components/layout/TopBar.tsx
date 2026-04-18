import { Bell } from 'lucide-react'
import type { Profile } from '@/types'

export default function TopBar({ profile }: { profile: Profile | null }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/60 bg-card/20 backdrop-blur-sm flex-shrink-0">
      <div>
        <p className="text-muted-foreground text-sm">{greeting},</p>
        <h2 className="text-foreground font-semibold text-sm leading-tight">
          {profile?.name ?? 'Friend'} 👋
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg bg-secondary/60 hover:bg-secondary flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
        </button>
      </div>
    </header>
  )
}
