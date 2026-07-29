import { useState, useCallback } from 'react'
import { Sliders, RefreshCw, Loader2, TrendingUp } from 'lucide-react'
import { simulateApi } from '../utils/api'
import type { StudentInput, AnalysisResult } from '../types'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

interface Props { lastInput: StudentInput | null }

const DEFAULT_INPUT: StudentInput = {
  name: 'Simulation Student',
  previous_gpa: 6.5,
  internal_score: 60,
  study_hours: 8,
  attendance: 70,
  assignment_rate: 75,
  parental_education: 2,
  internet_access: 1,
  extracurricular: 0,
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-3 text-sm shadow-xl">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></p>
      ))}
    </div>
  )
}

export default function SimulatorPanel({ lastInput }: Props) {
  const [form, setForm] = useState<StudentInput>(lastInput ?? DEFAULT_INPUT)
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
      setError('Backend not reachable. Start the FastAPI server (uvicorn main:app --reload).')
    } finally { setLoading(false) }
  }, [form])

  const riskColor = result?.risk_color === 'green' ? '#10b981'
    : result?.risk_color === 'amber' ? '#f59e0b' : '#ef4444'

  const radarData = result ? Object.entries(result.radar_data).map(([subject, value]) => ({
    subject, value
  })) : []

  const barData = result ? result.bar_data : []

  const SliderField = ({
    label, field, min, max, step = 1, unit = '', decimals = 0
  }: { label: string; field: keyof StudentInput; min: number; max: number; step?: number; unit?: string; decimals?: number }) => {
    const val = form[field] as number
    const pct = ((val - min) / (max - min)) * 100
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
          <span className="font-mono text-sm font-bold text-brand-300">{val.toFixed(decimals)}{unit}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={val}
          onChange={e => set(field, parseFloat(e.target.value))}
          className="w-full"
          style={{ background: `linear-gradient(to right, #1b85f1 ${pct}%, #1e2d4a ${pct}%)` }}
        />
      </div>
    )
  }

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

          <SliderField label="Study Hours / Week" field="study_hours" min={0} max={20} step={0.5} unit=" hrs" decimals={1} />
          <SliderField label="Attendance %" field="attendance" min={0} max={100} unit="%" />
          <SliderField label="Assignment Rate %" field="assignment_rate" min={0} max={100} unit="%" />
          <SliderField label="Internal Score" field="internal_score" min={0} max={100} unit="%" />
          <SliderField label="Previous GPA" field="previous_gpa" min={0} max={10} step={0.1} decimals={1} />

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
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e2d4a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} />
                    <Radar name="Score" dataKey="value" stroke={riskColor} fill={riskColor} fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" name="Simulated Score" fill={riskColor} radius={[6, 6, 0, 0]} />
              <Bar dataKey="benchmark" name="Benchmark" fill="#1e2d4a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
