import {
  Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import type { BarDataItem } from '../../types'
import { ChartTooltip } from './ChartTooltip'

interface Props {
  data: BarDataItem[]
  scoreColor?: string
  scoreName?: string
  height?: number
}

export default function ScoreBenchmarkChart({
  data, scoreColor = '#33a4fc', scoreName = 'Student Score', height = 280,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
        <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
        <ReferenceLine y={70} stroke="#1e2d4a" strokeDasharray="4 4" />
        <Bar dataKey="score" name={scoreName} fill={scoreColor} radius={[6, 6, 0, 0]} />
        <Bar dataKey="benchmark" name="Benchmark" fill="#1e2d4a" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
