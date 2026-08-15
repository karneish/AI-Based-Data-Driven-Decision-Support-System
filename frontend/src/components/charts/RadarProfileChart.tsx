import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface Props {
  data: Array<{ subject: string; value: number }>
  color?: string
  height?: number
  name?: string
}

export default function RadarProfileChart({
  data, color = '#33a4fc', height = 300, name = 'Score',
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#1e2d4a" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'DM Sans' }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
        <Radar
          name={name}
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
        />
        <Tooltip content={<ChartTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
