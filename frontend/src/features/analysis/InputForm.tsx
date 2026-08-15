import { useState } from 'react'
import { Loader2, BarChart3, ChevronDown, User } from 'lucide-react'
import { analyzeApi } from '../../lib/api'
import SliderField from '../../components/ui/SliderField'
import { PARENTAL_EDUCATION_LEVELS, PRESETS } from '../../constants/presets'
import type { StudentInput, AnalysisResult } from '../../types'

interface Props {
  onResult: (result: AnalysisResult, input: StudentInput) => void
  userName: string
}

export default function InputForm({ onResult, userName }: Props) {
  const [preset, setPreset] = useState<string>('custom')
  const [form, setForm] = useState<StudentInput>({ ...PRESETS.custom, name: userName })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const applyPreset = (key: string) => {
    setPreset(key)
    const p = PRESETS[key]
    setForm({ ...p, name: p.name || userName })
    setError('')
  }

  const set = (field: keyof StudentInput, value: number | string) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleAnalyze = async () => {
    if (!form.name.trim()) { setError('Please enter a student name.'); return }
    setLoading(true); setError('')
    try {
      const result = await analyzeApi(form)
      onResult(result, form)
    } catch {
      setError('Failed to connect to the analysis engine. Make sure the backend (Python FastAPI) is running on port 8000.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <div className="section-tag mb-3">Step 1 of 2</div>
        <h2 className="font-display font-bold text-2xl text-white">Student Data Input</h2>
        <p className="text-slate-400 text-sm mt-1">Enter academic indicators or select a preset profile to run the ML analysis.</p>
      </div>

      {/* Preset Dropdown */}
      <div className="glass-card p-5">
        <label className="label">Quick Preset Profile</label>
        <div className="relative">
          <select
            value={preset}
            onChange={e => applyPreset(e.target.value)}
            className="input-field appearance-none pr-10 cursor-pointer"
          >
            {Object.entries(PRESETS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <p className="text-xs text-slate-500 mt-2">Selecting a preset will auto-fill all fields below. You can still edit them manually.</p>
      </div>

      {/* Student Info */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Student Information
        </p>
        <div>
          <label className="label">Student Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Enter student name"
            className="input-field"
          />
        </div>
      </div>

      {/* Academic Indicators */}
      <div className="glass-card p-6 space-y-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Academic Indicators
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <SliderField label="Previous GPA" value={form.previous_gpa} min={0} max={10} step={0.1} decimals={1} onChange={v => set('previous_gpa', v)} />
          <SliderField label="Internal Assessment Score" value={form.internal_score} min={0} max={100} unit="%" onChange={v => set('internal_score', v)} />
          <SliderField label="Weekly Study Hours" value={form.study_hours} min={0} max={20} step={0.5} unit=" hrs" decimals={1} onChange={v => set('study_hours', v)} />
          <SliderField label="Attendance Percentage" value={form.attendance} min={0} max={100} unit="%" onChange={v => set('attendance', v)} />
          <SliderField label="Assignment Submission Rate" value={form.assignment_rate} min={0} max={100} unit="%" onChange={v => set('assignment_rate', v)} />
        </div>
      </div>

      {/* Behavioral Factors */}
      <div className="glass-card p-6 space-y-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Behavioral Factors</p>

        <div>
          <label className="label">Parental Education Level</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PARENTAL_EDUCATION_LEVELS.map((lbl, i) => (
              <button
                key={i}
                onClick={() => set('parental_education', i)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200
                  ${form.parental_education === i
                    ? 'bg-brand-600/20 border-brand-500/50 text-brand-300'
                    : 'bg-surface border-surface-border text-slate-400 hover:border-brand-500/30'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {[
            { label: 'Internet Access', field: 'internet_access' as keyof StudentInput },
            { label: 'Extracurricular Activities', field: 'extracurricular' as keyof StudentInput },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="label">{label}</label>
              <div className="flex gap-3">
                {['No', 'Yes'].map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => set(field, i)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200
                      ${form[field] === i
                        ? i === 1 ? 'bg-accent-green/15 border-accent-green/40 text-accent-green'
                                  : 'bg-accent-red/15 border-accent-red/40 text-accent-red'
                        : 'bg-surface border-surface-border text-slate-400 hover:border-brand-500/30'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className="glass-card p-4 grid grid-cols-3 md:grid-cols-5 gap-3 text-center">
        {[
          { label: 'GPA', value: `${form.previous_gpa.toFixed(1)}/10` },
          { label: 'Internal', value: `${form.internal_score}%` },
          { label: 'Attendance', value: `${form.attendance}%` },
          { label: 'Study Hrs', value: `${form.study_hours.toFixed(1)}/wk` },
          { label: 'Assignments', value: `${form.assignment_rate}%` },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className="font-mono font-semibold text-brand-300 text-sm">{value}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base"
      >
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Running ML Analysis...</>
          : <><BarChart3 className="w-5 h-5" /> Run Full Analysis</>
        }
      </button>
    </div>
  )
}
