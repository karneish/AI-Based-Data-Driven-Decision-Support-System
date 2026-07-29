import { useState } from 'react'
import { Brain, LogOut, BarChart3, Sliders, FileText, Home, Menu, X, FlaskConical } from 'lucide-react'
import type { User as UserType, StudentInput, AnalysisResult } from '../types'
import InputForm from '../components/InputForm'
import ResultPanel from '../components/ResultPanel'
import SimulatorPanel from '../components/SimulatorPanel'
import Infographics from '../components/Infographics'
import ModelComparisonPage from './ModelComparison'

interface Props { user: UserType; onLogout: () => void }
type Tab = 'home' | 'analyze' | 'simulate' | 'models' | 'report'

export default function Dashboard({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('home')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [lastInput, setLastInput] = useState<StudentInput | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleResult = (res: AnalysisResult, input: StudentInput) => {
    setResult(res); setLastInput(input); setTab('report')
  }

  const navItems: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: 'home',     icon: Home,         label: 'Overview' },
    { id: 'analyze',  icon: BarChart3,     label: 'Analyze' },
    { id: 'simulate', icon: Sliders,       label: 'Simulate' },
    { id: 'models',   icon: FlaskConical,  label: 'ML Models' },
    { id: 'report',   icon: FileText,      label: 'Report' },
  ]

  const tabTitle: Record<Tab, string> = {
    home:     `Hello, ${user.name} 👋`,
    analyze:  'Student Analysis',
    simulate: 'What-If Simulator',
    models:   'ML Model Comparison',
    report:   'Analysis Report',
  }

  return (
    <div className="min-h-screen bg-surface flex">

      {/* Sidebar */}
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
          <button className="ml-auto md:hidden text-slate-500" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
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

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setMobileOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                ${tab === id
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-surface-hover'}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {id === 'report' && result && (
                <span className="ml-auto w-2 h-2 rounded-full bg-accent-green" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
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

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-surface-card/80 backdrop-blur border-b border-surface-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-semibold text-white text-lg">{tabTitle[tab]}</h1>
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

        {/* Content */}
        <div className="flex-1 p-6">
          {tab === 'home'     && <Infographics onGoAnalyze={() => setTab('analyze')} result={result} />}
          {tab === 'analyze'  && <InputForm onResult={handleResult} userName={user.name} />}
          {tab === 'simulate' && <SimulatorPanel lastInput={lastInput} />}
          {tab === 'models'   && <ModelComparisonPage />}
          {tab === 'report'   && <ResultPanel result={result} />}
        </div>
      </main>
    </div>
  )
}
