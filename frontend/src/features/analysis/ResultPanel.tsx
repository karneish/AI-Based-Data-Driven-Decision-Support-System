import { ShieldCheck, TrendingUp, AlertTriangle, XCircle, Zap, Star, Download } from 'lucide-react'
import FeatureImportanceChart from '../../components/charts/FeatureImportanceChart'
import RadarProfileChart from '../../components/charts/RadarProfileChart'
import ScoreBenchmarkChart from '../../components/charts/ScoreBenchmarkChart'
import { IMPACT_CONFIG, MODEL_COLORS, RISK_CONFIG } from '../../constants/models'
import type { AnalysisResult } from '../../types'

interface Props { result: AnalysisResult | null }

function handlePrint(result: AnalysisResult) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>DSS-MIP Report - ${result.predicted_class}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #111; padding: 40px; }
        h1 { font-size: 24px; color: #1b85f1; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 13px; margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
        .card .val { font-size: 26px; font-weight: 800; color: #1b85f1; }
        .card .lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 12px; }
        .risk { padding: 16px; border-radius: 12px; border: 2px solid; margin-bottom: 24px; }
        .risk.green  { border-color: #10b981; background: #f0fdf4; color: #065f46; }
        .risk.amber  { border-color: #f59e0b; background: #fffbeb; color: #78350f; }
        .risk.red    { border-color: #ef4444; background: #fef2f2; color: #7f1d1d; }
        .rec { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
        .rec .impact { font-size: 10px; padding: 2px 8px; border-radius: 20px; display: inline-block; margin-left: 8px; }
        .impact-High   { background: #fef2f2; color: #dc2626; }
        .impact-Medium { background: #fffbeb; color: #d97706; }
        .impact-Low    { background: #f0fdf4; color: #16a34a; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f1f5f9; padding: 10px 12px; text-align: left; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        .footer { margin-top: 40px; text-align: center; color: #aaa; font-size: 11px; }
      </style>
    </head>
    <body>
      <h1>DSS-MIP — Academic Analysis Report</h1>
      <div class="subtitle">AI-Based Data-Driven Decision Support System · Generated on ${new Date().toLocaleString()}</div>

      <div class="grid">
        <div class="card"><div class="val">${result.ensemble_probability}%</div><div class="lbl">Ensemble Probability</div></div>
        <div class="card"><div class="val">${result.ml_probability}%</div><div class="lbl">ML Probability (${result.selected_model})</div></div>
        <div class="card"><div class="val">${result.confidence}%</div><div class="lbl">Model Confidence</div></div>
        <div class="card"><div class="val">${result.asi}%</div><div class="lbl">ASI Score</div></div>
      </div>
      <div class="grid">
        <div class="card"><div class="val">${result.risk_category}</div><div class="lbl">Risk Level</div></div>
        <div class="card"><div class="val">${result.predicted_class}</div><div class="lbl">Classification</div></div>
        <div class="card"><div class="val">${result.class_threshold}%</div><div class="lbl">AI Class Threshold</div></div>
        <div class="card"><div class="val">${result.all_model_probs.length}</div><div class="lbl">Models in Ensemble</div></div>
      </div>

      <div class="risk ${result.risk_color}">
        <strong style="font-size:18px">${result.risk_category}</strong><br/>
        <span style="font-size:13px">ASI Score: ${result.asi}% · Model: ${result.selected_model}</span>
      </div>

      <div class="section">
        <h2>Dimensional Scores</h2>
        <table>
          <tr><th>Dimension</th><th>Student Score</th><th>Benchmark</th><th>Status</th></tr>
          ${result.bar_data.map(b => `
            <tr>
              <td>${b.label}</td>
              <td><strong>${b.score}%</strong></td>
              <td>${b.benchmark}%</td>
              <td>${b.score >= b.benchmark ? '✅ Above' : '⚠️ Below'}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="section">
        <h2>Feature Importance (Random Forest)</h2>
        <table>
          <tr><th>Feature</th><th>Importance Score</th></tr>
          ${result.feature_importance.map(f => `
            <tr><td>${f.feature}</td><td>${(f.importance * 100).toFixed(1)}%</td></tr>
          `).join('')}
        </table>
      </div>

      <div class="section">
        <h2>Model Probability Comparison</h2>
        <table>
          <tr><th>Model</th><th>Probability</th></tr>
          ${result.all_model_probs.map(m => `
            <tr><td>${m.model}</td><td>${m.probability}%</td></tr>
          `).join('')}
        </table>
      </div>

      <div class="section">
        <h2>Intervention Recommendations</h2>
        ${result.recommendations.map((r, i) => `
          <div class="rec">
            <strong>#${i + 1} ${r.action}</strong>
            <span class="impact impact-${r.impact}">${r.impact} Impact</span>
            ${r.probability_gain > 0 ? `<span class="impact" style="background:#e0f2fe;color:#0369a1;margin-left:8px">+${r.probability_gain} pts predicted</span>` : ''}
            <div style="color:#666; font-size:12px; margin-top:6px">${r.detail}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>Detailed Report</h2>
        <p style="line-height:1.7; color:#333; font-size:13px">
          The AI-Based Decision Support System completed a comprehensive analysis using a trained
          ${result.selected_model} model. The ML prediction probability is <strong>${result.ml_probability}%</strong>,
          classifying this student as a <strong>${result.predicted_class}</strong>.
          The Academic Stability Index (ASI) is <strong>${result.asi}%</strong>, placing the student
          in the <strong>${result.risk_category}</strong> category.
          The top influencing factors were: ${result.feature_importance.slice(0, 3).map(f => f.feature).join(', ')}.
          ${result.recommendations.length} intervention recommendation(s) have been generated.
        </p>
      </div>

      <div class="footer">DSS-MIP · AI-Based Data-Driven Decision Support System · Mini Project</div>
    </body>
    </html>
  `
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }
}

export default function ResultPanel({ result }: Props) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <TrendingUp className="w-12 h-12 text-surface-border" />
        <div>
          <p className="text-slate-300 font-semibold">No Analysis Yet</p>
          <p className="text-slate-500 text-sm mt-1">Go to the <strong>Analyze</strong> tab, fill in student data, and run the ML model.</p>
        </div>
      </div>
    )
  }

  const RiskIcon = RISK_CONFIG[result.risk_category].icon
  const riskClass = RISK_CONFIG[result.risk_category].colorClass
  const riskGrad  = RISK_CONFIG[result.risk_category].grad

  const radarData = Object.entries(result.radar_data).map(([subject, value]) => ({ subject, value }))
  const fiData    = result.feature_importance.map(f => ({ name: f.feature, value: Math.round(f.importance * 100) }))

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="section-tag mb-3">Analysis Report</div>
          <h2 className="font-display font-bold text-2xl text-white">Full Academic Report</h2>
        </div>
        <button
          onClick={() => handlePrint(result)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ensemble Probability', value: `${result.ensemble_probability}%`, sub: '5-model soft vote',  color: 'text-brand-400' },
          { label: 'ML Probability',       value: `${result.ml_probability}%`,       sub: result.selected_model, color: 'text-accent-purple' },
          { label: 'ASI Score',            value: `${result.asi}%`,                  sub: 'AI-calibrated',       color: 'text-accent-cyan' },
          { label: 'Model Confidence',     value: `${result.confidence}%`,           sub: 'Cross-model agreement', color: 'text-accent-green' },
          { label: 'Predicted Class',      value: result.predicted_class,            sub: `Threshold ${result.class_threshold}%`, color: 'text-accent-amber' },
          { label: 'Recommendations',      value: `${result.recommendations.length}`, sub: 'Impact-ranked',      color: 'text-accent-amber' },
        ].map(k => (
          <div key={k.label} className="stat-card hover:border-brand-500/30 transition-all">
            <div className="text-xs text-slate-500 uppercase tracking-widest">{k.label}</div>
            <div className={`font-display font-bold text-2xl ${k.color} leading-tight mt-1`}>{k.value}</div>
            <div className="text-xs text-slate-600 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Risk Banner */}
      <div className={`glass-card p-5 border bg-gradient-to-r ${riskGrad} ${riskClass} flex items-center gap-4`}>
        <RiskIcon className="w-8 h-8 flex-shrink-0" />
        <div>
          <div className="font-display font-bold text-xl">{result.risk_category}</div>
          <div className="text-sm opacity-80 mt-0.5">
            {result.risk_category === 'Stable'                && 'Student is academically stable. Continue current practices.'}
            {result.risk_category === 'Monitor Closely'       && 'Moderate risk indicators. Increased monitoring recommended.'}
            {result.risk_category === 'Intervention Required' && 'Immediate academic intervention is strongly recommended.'}
          </div>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <div className="font-mono font-bold text-2xl">{result.asi}%</div>
          <div className="text-xs opacity-70">ASI Score</div>
        </div>
      </div>

      {/* ASI Gauge */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Academic Stability Index (ASI) Gauge — AI-calibrated bands</p>
        <div className="relative h-6 bg-surface rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div className="flex-none bg-accent-red/20" style={{ width: `${result.risk_thresholds.monitor * 100}%` }} />
            <div className="flex-none bg-accent-amber/20" style={{ width: `${(result.risk_thresholds.stable - result.risk_thresholds.monitor) * 100}%` }} />
            <div className="flex-none bg-accent-green/20" style={{ width: `${(1 - result.risk_thresholds.stable) * 100}%` }} />
          </div>
          <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
            style={{
              width: `${result.asi}%`,
              background: result.risk_color === 'green' ? '#10b981' : result.risk_color === 'amber' ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
          <span>0% — Intervention</span><span>{(result.risk_thresholds.monitor * 100).toFixed(0)}% — Monitor</span><span>{(result.risk_thresholds.stable * 100).toFixed(0)}% — Stable — 100%</span>
        </div>
      </div>

      {/* All-model probability comparison */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">All Models — Probability Comparison</p>
        <div className="space-y-3">
          {result.all_model_probs.map(m => (
            <div key={m.model}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: MODEL_COLORS[m.model] }} />
                  {m.model}
                  {m.model === result.selected_model && (
                    <span className="text-xs bg-brand-600/20 text-brand-400 border border-brand-500/30 px-2 py-0.5 rounded-full">Selected</span>
                  )}
                </span>
                <span className="font-mono font-bold text-sm" style={{ color: MODEL_COLORS[m.model] }}>{m.probability}%</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.probability}%`, background: MODEL_COLORS[m.model] }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Spider Chart */}
        <div className="glass-card p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Spider Chart — Multi-Dimensional Profile</p>
          <RadarProfileChart data={radarData} name="Student" />
        </div>

        {/* Feature Importance */}
        <div className="glass-card p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Feature Importance — Random Forest (%)</p>
          <FeatureImportanceChart data={fiData} />
        </div>
      </div>

      {/* Score vs Benchmark */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Score vs Benchmark — Column Chart</p>
        <ScoreBenchmarkChart data={result.bar_data} />
      </div>

      {/* Recommendations */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-5 h-5 text-brand-400" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ranked Intervention Recommendations</p>
        </div>
        <div className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-surface rounded-xl border border-surface-border hover:border-brand-500/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                <span className="font-mono text-xs text-brand-400 font-bold">#{i+1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-white text-sm">{rec.action}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${IMPACT_CONFIG[rec.impact].cls}`}>{rec.impact} Impact</span>
                  {rec.probability_gain > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-brand-600/15 text-brand-300 border-brand-500/30 font-mono">
                      +{rec.probability_gain} pts predicted
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{rec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Report */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Star className="w-5 h-5 text-accent-amber" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Detailed Overall Report</p>
        </div>
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm font-body">
          <p>
            The AI-Based Decision Support System completed a comprehensive analysis of the student's academic profile
            using a trained <strong className="text-white">{result.selected_model}</strong> model on a dataset of
            1,000 real student records.
          </p>
          <p>
            <strong className="text-white">ML Prediction:</strong> The model estimated a performance probability of{' '}
            <strong className="text-brand-400">{result.ml_probability}%</strong>, classifying this student as a{' '}
            <strong className="text-brand-300">{result.predicted_class}</strong>.
          </p>
          <p>
            <strong className="text-white">Academic Stability Index:</strong> The computed ASI score is{' '}
            <strong className="text-accent-cyan">{result.asi}%</strong> — derived from an AI-calibrated blend of
            ensemble ML probability, attendance, and study hours. This places the student in the{' '}
            <strong className={result.risk_color === 'green' ? 'text-accent-green' : result.risk_color === 'amber' ? 'text-accent-amber' : 'text-accent-red'}>
              {result.risk_category}
            </strong> category, using calibrated risk bands
            (Stable ≥ {(result.risk_thresholds.stable * 100).toFixed(0)}%, Monitor ≥ {(result.risk_thresholds.monitor * 100).toFixed(0)}%).
          </p>
          <p>
            <strong className="text-white">Key Influencing Factors:</strong>{' '}
            {result.feature_importance.slice(0, 3).map(f => f.feature).join(', ')} were the top predictors
            based on Random Forest feature importances.
          </p>
          <p>
            <strong className="text-white">Cross-Model Agreement:</strong>{' '}
            {result.all_model_probs.filter(m => m.probability >= result.class_threshold).length} out of {result.all_model_probs.length} models predict this
            student as a Strong Performer ({result.confidence}% agreement), showing{' '}
            {result.confidence >= 75 ? 'strong' : result.confidence >= 50 ? 'moderate' : 'weak'} consensus.
          </p>
          <p>
            <strong className="text-white">Recommendations:</strong> The recommendations below were generated by
            AI counterfactual simulation — each action was simulated against the trained ensemble to measure its
            predicted impact on this student's success probability, then ranked by expected gain.
          </p>
          <p>
            <strong className="text-white">Conclusion:</strong>{' '}
            {result.risk_category === 'Stable' && 'The student is performing at a stable level. Continued engagement is recommended to maintain this standing.'}
            {result.risk_category === 'Monitor Closely' && 'The student shows moderate risk. Advisors should increase check-in frequency and provide targeted support.'}
            {result.risk_category === 'Intervention Required' && 'Immediate academic intervention is required. A structured support plan should be implemented without delay.'}
            {' '}A total of <strong className="text-white">{result.recommendations.length} recommendation(s)</strong> have been generated. Use the <strong className="text-brand-400">Export PDF</strong> button above to save this report.
          </p>
        </div>
      </div>

    </div>
  )
}
