'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wallet, Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) { setError(error.message) } else { setStep('otp') }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data?.session) {
      // Wait a moment for cookie to be set then hard navigate
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } else {
      setError('Could not verify code. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <Wallet className="w-7 h-7 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {step === 'email' ? 'Welcome back' : 'Check your email'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {step === 'email' ? 'Enter your email to receive a login code' : `We sent a code to ${email}`}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8">
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                />
              </div>
            </div>
            {error && <div className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-3">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-background font-semibold py-2.5 rounded-lg transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send code <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Enter your code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="00000000"
                maxLength={8}
                required
                autoFocus
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-2xl text-center tracking-[0.4em] font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
              />
              <p className="text-xs text-muted-foreground text-center">Check your inbox and spam folder</p>
            </div>
            {error && <div className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-3">{error}</div>}
            <button type="submit" disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-background font-semibold py-2.5 rounded-lg transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & sign in <CheckCircle2 className="w-4 h-4" /></>}
            </button>
            <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(null) }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
