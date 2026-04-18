'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-rose-400" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">Something went wrong</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-background font-semibold text-sm rounded-xl transition-all"
      >
        Try again
      </button>
    </div>
  )
}
