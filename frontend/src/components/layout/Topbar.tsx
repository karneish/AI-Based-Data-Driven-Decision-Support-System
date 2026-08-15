import { Menu } from 'lucide-react'
import type { User } from '../../types'

interface Props {
  user: User
  title: string
  onOpenMobile: () => void
}

export default function Topbar({ user, title, onOpenMobile }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-surface-card/80 backdrop-blur border-b border-surface-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-400" onClick={onOpenMobile}>
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-semibold text-white text-lg">{title}</h1>
          <p className="text-xs text-slate-500 font-mono hidden sm:block">
            DSS-MIP v2.0 · 4 ML Models · 1000 Training Samples
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 bg-surface px-3 py-1.5 rounded-lg border border-surface-border">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          4 Models Active
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center text-white font-bold text-sm">
          {user.name.charAt(0)}
        </div>
      </div>
    </header>
  )
}
