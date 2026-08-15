export interface User {
  username: string
  name: string
  role: 'student' | 'advisor'
}

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
  impact: 'High' | 'Medium' | 'Low'
  detail: string
}

export interface BarDataItem {
  label: string
  score: number
  benchmark: number
}

export interface ModelProb {
  model: string
  probability: number
}

export interface AnalysisResult {
  ml_probability: number
  asi: number
  risk_category: 'Stable' | 'Monitor Closely' | 'Intervention Required'
  risk_color: 'green' | 'amber' | 'red'
  feature_importance: FeatureImportance[]
  radar_data: Record<string, number>
  bar_data: BarDataItem[]
  recommendations: Recommendation[]
  predicted_class: string
  selected_model: string
  all_model_probs: ModelProb[]
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

export interface ModelComparisonData {
  models: ModelMetrics[]
  best_model: string
  dataset_info: {
    total_samples: number
    train_samples: number
    test_samples: number
    features: number
    classes: string[]
  }
}

export type DashboardTab = 'home' | 'analyze' | 'simulate' | 'models' | 'report'
