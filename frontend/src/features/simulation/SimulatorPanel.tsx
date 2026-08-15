import { useState, useCallback } from 'react'
import { Sliders, RefreshCw, Loader2, TrendingUp } from 'lucide-react'
import RadarProfileChart from '../../components/charts/RadarProfileChart'
import ScoreBenchmarkChart from '../../components/charts/ScoreBenchmarkChart'
import SliderField from '../../components/ui/SliderField'
import { DEFAULT_SIMULATION_INPUT } from '../../constants/presets'
import { simulateApi } from '../../lib/api'
import type { StudentInput, AnalysisResult } from '../../types'

interface Props { lastInput: StudentInput | null }

export default function SimulatorPanel({ lastInput }: Props) {
  const [form, setForm] = useState<StudentInput>(lastInput ?? DEFAULT_SIMULATION_INPUT)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof StudentInput, value: number) =>
    setForm(f => ({ ...f, [field]: value }))

  const runSim = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await simulateApi(form)
      setResult(res)
    } catch {
      setError('Backend not reachable. Start the FastAPI server (uvicorn app.main:app --reload).')
    } finally { setLoading(false) }
  }, [form])

  const riskColor = result?.risk_color === 'green' ? '#10b981'
    : result?.risk_color === 'amber' ? '#f59e0b' : '#ef4444'

  const radarData = result ? Object.entries(result.radar_data).map(([subject, value]) => ({
    subject, value
  })) : []

  const barData = result ? result.bar_data : []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="section-tag mb-3">What-If Simulation</div>
        <h2 className="font-display font-bold text-2xl text-white">Interactive Scenario Simulator</h2>
        <p className="text-slate-400 text-sm mt-1">
          Adjust the sliders below and run the simulation to instantly see how changes in academic behaviour would shift the ASI score and risk level.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Controls */}
        <div className="glass-card p-6 space-y-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Adjust Variables
          </p>

          <SliderField label="Study Hours / Week" value={form.study_hours} min={0} max={20} step={0.5} unit=" hrs" decimals={1} onChange={v => set('study_hours', v)} />
          <SliderField label="Attendance %" value={form.attendance} min={0} max={100} unit="%" onChange={v => set('attendance', v)} />
          <SliderField label="Assignment Rate %" value={form.assignment_rate} min={0} max={100} unit="%" onChange={v => set('assignment_rate', v)} />
          <SliderField label="Internal Score" value={form.internal_score} min={0} max={100} unit="%" onChange={v => set('internal_score', v)} />
          <SliderField label="Previous GPA" value={form.previous_gpa} min={0} max={10} step={0.1} decimals={1} onChange={v => set('previous_gpa', v)} />

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Extracurricular</label>
            <div className="flex gap-3">
              {['No', 'Yes'].map((opt, i) => (
                <button key={opt} onClick={() => set('extracurricular', i)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                    ${form.extracurricular === i
                      ? i === 1 ? 'bg-accent-green/15 border-accent-green/40 text-accent-green'
                               : 'bg-surface-hover border-surface-border text-slate-300'
                      : 'bg-surface border-surface-border text-slate-500'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-xs">
              {error}
            </div>
          )}

          <button onClick={runSim} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Simulating...</>
              : <><RefreshCw className="w-4 h-4" /> Run Simulation</>}
          </button>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ML Probability', value: `${result.ml_probability}%`, color: 'text-brand-400' },
                  { label: 'ASI Score', value: `${result.asi}%`, color: 'text-accent-cyan' },
                ].map(k => (
                  <div key={k.label} className="stat-card text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-widest">{k.label}</div>
                    <div className={`font-display font-bold text-3xl ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Risk Badge */}
              <div className="glass-card p-4 flex items-center gap-3"
                style={{ borderColor: `${riskColor}33` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: riskColor }} />
                <div>
                  <div className="font-display font-bold text-white">{result.risk_category}</div>
                  <div className="text-xs text-slate-400">{result.predicted_class}</div>
                </div>
                <div className="ml-auto font-mono font-bold text-2xl" style={{ color: riskColor }}>
                  {result.asi}%
                </div>
              </div>

              {/* ASI bar */}
              <div className="glass-card p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">ASI Gauge</p>
                <div className="h-4 bg-surface rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 flex">
                    <div className="w-[45%] bg-accent-red/20" />
                    <div className="w-[25%] bg-accent-amber/20" />
                    <div className="w-[30%] bg-accent-green/20" />
                  </div>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${result.asi}%`, background: riskColor }} />
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-600 mt-1">
                  <span>0</span><span>45</span><span>70</span><span>100</span>
                </div>
              </div>

              {/* Radar */}
              <div className="glass-card p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Profile Spider</p>
                <RadarProfileChart data={radarData} color={riskColor} height={220} />
              </div>
            </>
          ) : (
            <div className="glass-card p-8 flex flex-col items-center justify-center gap-4 text-center h-full min-h-[300px]">
              <TrendingUp className="w-10 h-10 text-surface-border" />
              <div>
                <p className="text-slate-300 font-semibold">Adjust and Simulate</p>
                <p className="text-slate-500 text-sm mt-1">Set the sliders on the left and click <strong className="text-brand-400">Run Simulation</strong> to see live results.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart comparison */}
      {result && (
        <div className="glass-card p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Simulated Score vs Benchmark</p>
          <ScoreBenchmarkChart data={barData} scoreColor={riskColor} scoreName="Simulated Score" height={240} />
        </div>
      )}
    </div>
  )
}
