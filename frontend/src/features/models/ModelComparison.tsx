import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Trophy, Loader2, Database, CheckCircle } from 'lucide-react'
import { ChartTooltip } from '../../components/charts/ChartTooltip'
import { METRIC_LABELS, MODEL_COLORS, PERFORMANCE_METRICS } from '../../constants/models'
import { useAsync } from '../../hooks/useAsync'
import { getModelComparison } from '../../lib/api'
import type { ModelComparisonData } from '../../types'

function ConfusionMatrix({ cm, modelName }: { cm: number[][], modelName: string }) {
  const [[tn, fp], [fn, tp]] = cm
  const total = tn + fp + fn + tp
  const cells = [
    { label: 'True Negative',  value: tn, color: '#10b981', desc: 'Correctly predicted Weak' },
    { label: 'False Positive', value: fp, color: '#ef4444', desc: 'Predicted Strong, actually Weak' },
    { label: 'False Negative', value: fn, color: '#f59e0b', desc: 'Predicted Weak, actually Strong' },
    { label: 'True Positive',  value: tp, color: '#33a4fc', desc: 'Correctly predicted Strong' },
  ]

  return (
    <div className="glass-card p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
        Confusion Matrix — {modelName}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {cells.map(c => (
          <div key={c.label} className="rounded-xl p-3 text-center" style={{ background: `${c.color}15`, border: `1px solid ${c.color}33` }}>
            <div className="font-display font-bold text-2xl" style={{ color: c.color }}>{c.value}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: c.color }}>{c.label}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">{c.desc}</div>
            <div className="text-xs text-slate-600 mt-1 font-mono">{((c.value / total) * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-slate-500 font-mono justify-center">
        <span>Predicted: <strong className="text-slate-300">Weak | Strong</strong></span>
        <span>Total: <strong className="text-slate-300">{total}</strong></span>
      </div>
    </div>
  )
}

export default function ModelComparisonPage() {
  const { data, loading, error } = useAsync<ModelComparisonData>(
    getModelComparison,
    [],
    'Could not load model comparison. Make sure the backend is running.',
  )
  const [selectedModel, setSelectedModel] = useState<string>('')

  useEffect(() => {
    if (data) setSelectedModel(data.best_model)
  }, [data])

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Loading model comparison data...</span>
    </div>
  )

  if (error) return (
    <div className="glass-card p-6 text-accent-red border-accent-red/30 text-sm">{error}</div>
  )

  if (!data) return null

  const metrics = PERFORMANCE_METRICS
  const metricLabels = METRIC_LABELS

  // Bar chart data — one entry per metric
  const barChartData = metrics.map(m => {
    const entry: any = { metric: metricLabels[m] }
    data.models.forEach(model => { entry[model.model] = (model as any)[m] })
    return entry
  })

  // Radar data per model
  const radarData = metrics.map(m => {
    const entry: any = { metric: metricLabels[m] }
    data.models.forEach(model => { entry[model.model] = (model as any)[m] })
    return entry
  })

  const selectedModelData = data.models.find(m => m.model === selectedModel)

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <div className="section-tag mb-3">ML Evaluation</div>
        <h2 className="font-display font-bold text-2xl text-white">Model Comparison & Evaluation</h2>
        <p className="text-slate-400 text-sm mt-1">
          All four models trained on 800 student records and evaluated on 200 test samples.
        </p>
      </div>

      {/* Dataset Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Samples',  value: data.dataset_info.total_samples.toString(), icon: Database },
          { label: 'Train Samples',  value: data.dataset_info.train_samples.toString(), icon: Database },
          { label: 'Test Samples',   value: data.dataset_info.test_samples.toString(),  icon: Database },
          { label: 'Features Used',  value: data.dataset_info.features.toString(),      icon: CheckCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat-card text-center items-center">
            <Icon className="w-4 h-4 text-brand-400 mb-1" />
            <div className="font-display font-bold text-2xl text-white">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Best Model Banner */}
      <div className="glass-card p-5 border-accent-green/30 bg-gradient-to-r from-accent-green/10 to-transparent flex items-center gap-4">
        <Trophy className="w-8 h-8 text-accent-green flex-shrink-0" />
        <div>
          <div className="font-display font-bold text-xl text-accent-green">Best Model: {data.best_model}</div>
          <div className="text-sm text-slate-400 mt-0.5">
            Achieved highest accuracy of{' '}
            <strong className="text-white">
              {data.models.find(m => m.model === data.best_model)?.accuracy}%
            </strong>{' '}
            on the test set with AUC-ROC of{' '}
            <strong className="text-white">
              {data.models.find(m => m.model === data.best_model)?.auc}%
            </strong>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="glass-card p-6 overflow-x-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Performance Metrics Table</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left py-3 px-4 text-slate-400 font-semibold">Model</th>
              {metrics.map(m => (
                <th key={m} className="text-center py-3 px-3 text-slate-400 font-semibold">{metricLabels[m]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.models.map(model => (
              <tr
                key={model.model}
                className={`border-b border-surface-border/50 transition-colors cursor-pointer
                  ${selectedModel === model.model ? 'bg-brand-600/10' : 'hover:bg-surface-hover'}`}
                onClick={() => setSelectedModel(model.model)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: MODEL_COLORS[model.model] }} />
                    <span className="font-medium text-white">{model.model}</span>
                    {model.model === data.best_model && (
                      <span className="text-xs bg-accent-green/15 text-accent-green border border-accent-green/30 px-2 py-0.5 rounded-full">Best</span>
                    )}
                  </div>
                </td>
                {metrics.map(m => {
                  const val = (model as any)[m]
                  const isBest = data.models.every(other => (other as any)[m] <= val)
                  return (
                    <td key={m} className={`text-center py-3 px-3 font-mono text-sm ${isBest ? 'text-accent-green font-bold' : 'text-slate-300'}`}>
                      {val}%
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-slate-600 mt-3">Click a row to view its confusion matrix below. Green values = best in column.</p>
      </div>

      {/* Bar Chart — all metrics */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Metrics Comparison — Bar Chart</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
            <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            {data.models.map(m => (
              <Bar key={m.model} dataKey={m.model} fill={MODEL_COLORS[m.model]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar comparison */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Model Performance — Radar Overlay</p>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e2d4a" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <PolarRadiusAxis domain={[60, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
            {data.models.map(m => (
              <Radar
                key={m.model}
                name={m.model}
                dataKey={m.model}
                stroke={MODEL_COLORS[m.model]}
                fill={MODEL_COLORS[m.model]}
                fillOpacity={0.08}
                strokeWidth={2}
              />
            ))}
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Confusion matrices */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Confusion Matrix — <span className="text-brand-400">{selectedModel}</span>
          <span className="text-slate-600 normal-case font-normal ml-2">(click a row in the table above to switch)</span>
        </p>
        {selectedModelData && (
          <div className="max-w-md">
            <ConfusionMatrix cm={selectedModelData.confusion_matrix} modelName={selectedModel} />
          </div>
        )}
      </div>

      {/* All confusion matrices grid */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">All Confusion Matrices</p>
        <div className="grid md:grid-cols-2 gap-5">
          {data.models.map(m => (
            <ConfusionMatrix key={m.model} cm={m.confusion_matrix} modelName={m.model} />
          ))}
        </div>
      </div>

    </div>
  )
}
