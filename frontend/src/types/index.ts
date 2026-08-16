export interface StudentInput {
  name: string
  previous_gpa: number
  internal_score: number
  study_hours: number
  attendance: number
  assignment_rate: number
  parental_education: number
  internet_access: number
  extracurricular: number
}

export interface FeatureImportance {
  feature: string
  importance: number
}

export interface Recommendation {
  action: string
  impact: "High" | "Medium" | "Low"
  detail: string
  probability_gain: number
}

export interface ModelProbability {
  model: string
  probability: number
}

export interface RiskThresholds {
  stable: number
  monitor: number
}

export interface AsiWeights {
  ml_probability: number
  attendance: number
  study_hours: number
}

export interface BarDatum {
  label: string
  score: number
  benchmark: number
}

export type RiskColor = "green" | "amber" | "red"
export type RiskCategory = "Stable" | "Monitor Closely" | "Intervention Required"

export interface AnalysisResult {
  ml_probability: number
  ensemble_probability: number
  confidence: number
  class_threshold: number
  asi: number
  risk_category: RiskCategory
  risk_color: RiskColor
  risk_thresholds: RiskThresholds
  asi_weights: AsiWeights
  feature_importance: FeatureImportance[]
  radar_data: Record<string, number>
  bar_data: BarDatum[]
  recommendations: Recommendation[]
  predicted_class: string
  selected_model: string
  all_model_probs: ModelProbability[]
}

export interface ModelMetrics {
  model: string
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  auc: number
  cv_score: number
  confusion_matrix: number[][]
}

export interface DatasetInfo {
  total_samples: number
  train_samples: number
  test_samples: number
  features: number
  classes: string[]
}

export interface ModelComparisonData {
  models: ModelMetrics[]
  best_model: string
  dataset_info: DatasetInfo
}

export interface FeatureImportanceResponse {
  feature_importance: FeatureImportance[]
}

export interface User {
  success: boolean
  name: string
  role: string
  username: string
  token: string
}

export interface UserRecord {
  id: number
  username: string
  name: string
  role: string
  created_at: string
}

export interface Student {
  id: number
  user_id: number | null
  name: string
  previous_gpa: number
  internal_score: number
  study_hours: number
  attendance: number
  assignment_rate: number
  parental_education: number
  internet_access: number
  extracurricular: number
  created_at: string
  updated_at: string
}

export interface ReportRecord {
  id: number
  student_id: number
  student_name: string
  input_snapshot: Record<string, unknown>
  result: AnalysisResult
  created_by: string | null
  created_at: string
}

export type InterventionStatus = "open" | "in_progress" | "done"

export interface Intervention {
  id: number
  student_id: number
  student_name: string
  action: string
  status: InterventionStatus
  notes: string
  priority: "High" | "Medium" | "Low"
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AnalyzeStudentResponse {
  report: ReportRecord
  result: AnalysisResult
}
