export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl border border-border/60 p-6 space-y-3">
      <div className="skeleton h-4 w-24 rounded-full" />
      <div className="skeleton h-8 w-36 rounded-lg" />
      <div className="skeleton h-3 w-20 rounded-full" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 border-b border-border/40">
      <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-40 rounded-full" />
        <div className="skeleton h-3 w-24 rounded-full" />
      </div>
      <div className="skeleton h-4 w-20 rounded-full" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-2xl border border-border/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60">
        <div className="skeleton h-4 w-32 rounded-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

export default function LoadingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-7 w-48 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable />
    </div>
  )
}
