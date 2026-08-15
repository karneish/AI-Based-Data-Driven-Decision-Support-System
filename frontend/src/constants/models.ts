import { AlertTriangle, ShieldCheck, XCircle } from 'lucide-react'

export const MODEL_COLORS: Record<string, string> = {
  'Logistic Regression': '#33a4fc',
  'Decision Tree':       '#a855f7',
  'Random Forest':       '#10b981',
  'K-Nearest Neighbors': '#f59e0b',
}

export const RISK_CONFIG = {
  'Stable':                { icon: ShieldCheck,   colorClass: 'risk-stable',    grad: 'from-accent-green/20 to-transparent' },
  'Monitor Closely':       { icon: AlertTriangle, colorClass: 'risk-monitor',   grad: 'from-accent-amber/20 to-transparent' },
  'Intervention Required': { icon: XCircle,       colorClass: 'risk-intervene', grad: 'from-accent-red/20 to-transparent' },
} as const

export const IMPACT_CONFIG = {
  High:   { cls: 'bg-accent-red/10   text-accent-red   border-accent-red/30' },
  Medium: { cls: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30' },
  Low:    { cls: 'bg-accent-green/10 text-accent-green border-accent-green/30' },
} as const

export const METRIC_LABELS: Record<string, string> = {
  accuracy: 'Accuracy',
  precision: 'Precision',
  recall: 'Recall',
  f1_score: 'F1 Score',
  auc: 'AUC-ROC',
  cv_score: 'CV Score',
}

export const PERFORMANCE_METRICS = ['accuracy', 'precision', 'recall', 'f1_score', 'auc', 'cv_score']
