import { useState } from 'react'
import { Brain, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { loginApi } from '../utils/api'
import type { User } from '../types'

interface Props {
  onLogin: (user: User) => void
  onBack: () => void
}

export default function LoginPage({ onLogin, onBack }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [greeting, setGreeting] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!username || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      const user = await loginApi(username.trim(), password)
      setGreeting(`Welcome back, ${user.name}! 👋`)
      setTimeout(() => onLogin(user), 1200)
    } catch {
      setError('Invalid username or password. Try: karneish / pass123')
    } finally {
      setLoading(false)
    }
  }

  const demoUsers = [
    { username: 'karneish', password: 'pass123', label: 'Student' },
    { username: 'admin', password: 'admin123', label: 'Advisor' },
    { username: 'student1', password: 'pass123', label: 'Arjun Sharma' },
  ]

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-hero-glow pointer-events-none" />

      {/* Glowing orbs */}
      <div className="fixed top-1/4 left-1/4 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-60 h-60 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-8 font-body">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="glass-card p-8 border-brand-500/20">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-2xl text-white text-center mb-1">Sign In</h1>
          <p className="text-slate-400 text-sm text-center mb-8 font-body">
            DSS-MIP · Academic Decision Support
          </p>

          {/* Greeting flash */}
          {greeting && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-sm font-medium text-center animate-fade-in">
              {greeting}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. karneish"
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-slate-600 font-mono">quick demo</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          {/* Demo quick-fill */}
          <div className="space-y-2">
            {demoUsers.map(u => (
              <button
                key={u.username}
                onClick={() => { setUsername(u.username); setPassword(u.password); setError('') }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-surface-border hover:border-brand-500/50 hover:bg-surface-hover transition-all duration-200 text-sm"
              >
                <span className="font-mono text-brand-400">{u.username}</span>
                <span className="text-slate-500 text-xs">{u.label}</span>
                <span className="text-slate-600 font-mono text-xs">→ fill</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6 font-mono">
          Mini Project · AI-Based DSS · Academic Analytics Platform
        </p>
      </div>
    </div>
  )
}
