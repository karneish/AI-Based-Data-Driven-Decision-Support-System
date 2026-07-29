import axios from 'axios'
import type { StudentInput, AnalysisResult, User, ModelComparisonData } from '../types'

const api = axios.create({ baseURL: '/api' })

export async function loginApi(username: string, password: string): Promise<User> {
  const { data } = await api.post('/login', { username, password })
  return data
}

export async function analyzeApi(input: StudentInput): Promise<AnalysisResult> {
  const { data } = await api.post('/analyze', input)
  return data
}

export async function simulateApi(input: StudentInput): Promise<AnalysisResult> {
  const { data } = await api.post('/simulate', input)
  return data
}

export async function getModelComparison(): Promise<ModelComparisonData> {
  const { data } = await api.get('/model-comparison')
  return data
}
