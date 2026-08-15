import { BarChart3, Brain, FileText, FlaskConical, Home, LogOut, Sliders, X } from 'lucide-react'
import type { DashboardTab, User } from '../../types'

interface Props {
  user: User
  activeTab: DashboardTab
  hasResult: boolean
  mobileOpen: boolean
  onTabChange: (tab: DashboardTab) => void
  onCloseMobile: () => void
  onLogout: () => void
}

const NAV_ITEMS: { id: DashboardTab; icon: typeof Home; label: string }[] = [
  { id: 'home',     icon: Home,        label: 'Overview' },
  { id: 'analyze',  icon: BarChart3,   label: 'Analyze' },
  { id: 'simulate', icon: Sliders,     label: 'Simulate' },
  { id: 'models',   icon: FlaskConical,label: 'ML Models' },
  { id: 'report',   icon: FileText,    label: 'Report' },
]

export default function Sidebar({
  user, activeTab, hasResult, mobileOpen, onTabChange, onCloseMobile, onLogout,
}: Props) {
  return (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-surface-border
      flex flex-col transition-transform duration-300
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="flex items-center gap-3 p-5 border-b border-surface-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-lg text-white">DSS<span className="text-brand-400">-MIP</span></span>
        <button className="ml-auto md:hidden text-slate-500" onClick={onCloseMobile}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-surface-border">
        <div className="flex items-center gap-3 bg-surface rounded-xl p-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { onTabChange(id); onCloseMobile() }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
              ${activeTab === id
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-surface-hover'}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {id === 'report' && hasResult && (
              <span className="ml-auto w-2 h-2 rounded-full bg-accent-green" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-surface-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-red hover:bg-accent-red/10 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
