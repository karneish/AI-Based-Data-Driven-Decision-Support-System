import { useState } from 'react'
import type { AnalysisResult, DashboardTab, StudentInput, User } from '../types'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import InputForm from '../features/analysis/InputForm'
import ResultPanel from '../features/analysis/ResultPanel'
import Infographics from '../features/home/Infographics'
import ModelComparisonPage from '../features/models/ModelComparison'
import SimulatorPanel from '../features/simulation/SimulatorPanel'

interface Props {
  user: User
  onLogout: () => void
}

const TAB_TITLES: Record<DashboardTab, string> = {
  home:     'Overview',
  analyze:  'Student Analysis',
  simulate: 'What-If Simulator',
  models:   'ML Model Comparison',
  report:   'Analysis Report',
}

export default function Dashboard({ user, onLogout }: Props) {
  const [tab, setTab] = useState<DashboardTab>('home')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [lastInput, setLastInput] = useState<StudentInput | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleResult = (res: AnalysisResult, input: StudentInput) => {
    setResult(res); setLastInput(input); setTab('report')
  }

  const title = tab === 'home' ? `Hello, ${user.name} 👋` : TAB_TITLES[tab]

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar
        user={user}
        activeTab={tab}
        hasResult={!!result}
        mobileOpen={mobileOpen}
        onTabChange={setTab}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={onLogout}
      />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        <Topbar user={user} title={title} onOpenMobile={() => setMobileOpen(true)} />

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
