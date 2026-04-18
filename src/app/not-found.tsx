import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center text-center p-4">
      <div>
        <p className="text-8xl font-black text-emerald-400/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground text-sm mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-background font-semibold text-sm rounded-xl transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
