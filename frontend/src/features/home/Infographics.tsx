import { Brain, TrendingUp, ShieldCheck, Target, ArrowRight, Activity, BookOpen, Zap } from 'lucide-react'
import type { AnalysisResult } from '../../types'

interface Props {
  onGoAnalyze: () => void
  result: AnalysisResult | null
}

const riskColorMap = {
  green: 'text-accent-green bg-accent-green/10 border-accent-green/30',
  amber: 'text-accent-amber bg-accent-amber/10 border-accent-amber/30',
  red:   'text-accent-red   bg-accent-red/10   border-accent-red/30',
}

export default function Infographics({ onGoAnalyze, result }: Props) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Welcome banner */}
      <div className="glass-card p-6 border-brand-500/20 bg-gradient-to-r from-brand-950/50 to-surface-card relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="section-tag mb-3">Platform Overview</div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">
              AI-Based Data-Driven Decision Support System
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Navigate to <strong className="text-brand-400">Analyze</strong> to input student data, view ML predictions,
              ASI scores, risk classifications, and get detailed visual reports.
            </p>
          </div>
          <button onClick={onGoAnalyze} className="btn-primary flex items-center gap-2">
            Start Analysis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Last result summary (if available) */}
      {result && (
        <div className="glass-card p-5 border-accent-green/20">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Last Analysis Result</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-brand-400">{result.ml_probability}%</div>
              <div className="text-xs text-slate-500 mt-1">ML Probability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-accent-cyan">{result.asi}%</div>
              <div className="text-xs text-slate-500 mt-1">ASI Score</div>
            </div>
            <div className="text-center">
              <div className={`text-sm font-semibold px-3 py-1 rounded-full border inline-block ${riskColorMap[result.risk_color]}`}>
                {result.risk_category}
              </div>
              <div className="text-xs text-slate-500 mt-1">Risk Level</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white">{result.predicted_class}</div>
              <div className="text-xs text-slate-500 mt-1">Predicted Class</div>
            </div>
          </div>
        </div>
      )}

      {/* System architecture infographic */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">System Architecture — 7-Layer Pipeline</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { n: '01', label: 'Input Layer', icon: BookOpen, color: 'from-brand-600 to-brand-500' },
            { n: '02', label: 'Preprocessing', icon: Activity, color: 'from-accent-cyan/80 to-brand-500' },
            { n: '03', label: 'ML Prediction', icon: Brain, color: 'from-accent-purple to-brand-600' },
            { n: '04', label: 'ASI Compute', icon: TrendingUp, color: 'from-brand-500 to-accent-cyan/80' },
            { n: '05', label: 'Risk Classify', icon: ShieldCheck, color: 'from-accent-amber/80 to-accent-red/60' },
            { n: '06', label: 'Recommend', icon: Zap, color: 'from-accent-green/80 to-brand-500' },
            { n: '07', label: 'Visualization', icon: Target, color: 'from-accent-purple to-accent-cyan/80' },
          ].map(({ n, label, icon: Icon, color }) => (
            <div key={n} className="glass-card p-3 text-center hover:border-brand-500/40 transition-all group hover:-translate-y-1">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="font-mono text-xs text-brand-400 mb-1">{n}</div>
              <div className="text-xs text-slate-300 font-medium leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ASI Formula */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass-card p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">ASI Formula</p>
          <div className="bg-surface rounded-xl p-4 font-mono text-sm space-y-2">
            <p className="text-accent-cyan">ASI =</p>
            <p className="pl-4 text-slate-300">
              <span className="text-brand-400">ML Probability</span> × 0.50
            </p>
            <p className="pl-4 text-slate-300">
              + <span className="text-accent-green">Attendance</span> × 0.30
            </p>
            <p className="pl-4 text-slate-300">
              + <span className="text-accent-amber">Study Hours</span> × 0.20
            </p>
            <div className="border-t border-surface-border mt-3 pt-3 text-xs text-slate-500">
              Range: 0.00 → 1.00 (higher = more stable)
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Risk Thresholds</p>
          <div className="space-y-3">
            {[
              { label: 'Stable', range: 'ASI ≥ 0.70', color: 'accent-green', bar: 100 },
              { label: 'Monitor Closely', range: '0.45 ≤ ASI < 0.70', color: 'accent-amber', bar: 60 },
              { label: 'Intervention Required', range: 'ASI < 0.45', color: 'accent-red', bar: 30 },
            ].map(({ label, range, color, bar }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium text-${color}`}>{label}</span>
                  <span className="text-xs font-mono text-slate-500">{range}</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${color} rounded-full transition-all`}
                    style={{ width: `${bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input features reference */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Input Features Used in Analysis</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Previous GPA', range: '0 – 10', weight: 'High' },
            { name: 'Internal Score', range: '0 – 100', weight: 'High' },
            { name: 'Study Hours/Week', range: '0 – 20 hrs', weight: 'Medium' },
            { name: 'Attendance %', range: '0 – 100%', weight: 'High' },
            { name: 'Assignment Rate', range: '0 – 100%', weight: 'Medium' },
            { name: 'Parental Education', range: '0 – 3 levels', weight: 'Low' },
            { name: 'Internet Access', range: 'Yes / No', weight: 'Low' },
            { name: 'Extracurricular', range: 'Yes / No', weight: 'Low' },
          ].map(f => (
            <div key={f.name} className="bg-surface rounded-xl p-3">
              <div className="text-sm font-medium text-white mb-1">{f.name}</div>
              <div className="text-xs text-slate-500 mb-2">{f.range}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                f.weight === 'High' ? 'bg-accent-green/10 text-accent-green' :
                f.weight === 'Medium' ? 'bg-accent-amber/10 text-accent-amber' :
                'bg-slate-700/50 text-slate-400'
              }`}>
                {f.weight} weight
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
