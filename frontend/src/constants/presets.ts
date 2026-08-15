import type { StudentInput } from '../types'

export const PRESETS: Record<string, StudentInput & { label: string }> = {
  custom: {
    label: 'Custom Input',
    name: '',
    previous_gpa: 7,
    internal_score: 65,
    study_hours: 10,
    attendance: 75,
    assignment_rate: 80,
    parental_education: 2,
    internet_access: 1,
    extracurricular: 0,
  },
  topPerformer: {
    label: 'Top Performer',
    name: 'Priya Menon',
    previous_gpa: 9.2,
    internal_score: 88,
    study_hours: 16,
    attendance: 95,
    assignment_rate: 98,
    parental_education: 3,
    internet_access: 1,
    extracurricular: 1,
  },
  averageStudent: {
    label: 'Average Student',
    name: 'Arjun Sharma',
    previous_gpa: 6.5,
    internal_score: 60,
    study_hours: 9,
    attendance: 72,
    assignment_rate: 75,
    parental_education: 2,
    internet_access: 1,
    extracurricular: 0,
  },
  atRisk: {
    label: 'At-Risk Student',
    name: 'Ravi Kumar',
    previous_gpa: 4.2,
    internal_score: 38,
    study_hours: 4,
    attendance: 52,
    assignment_rate: 50,
    parental_education: 1,
    internet_access: 0,
    extracurricular: 0,
  },
}

export const PARENTAL_EDUCATION_LEVELS = [
  'No Formal Education',
  'School Level',
  'College Graduate',
  'Postgraduate',
]

export const DEFAULT_SIMULATION_INPUT: StudentInput = {
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
