import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface Props {
  data: Array<{ name: string; value: number }>
}

const COLORS = ['#33a4fc', '#06d6f7', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

export default function FeatureImportanceChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false} />
        <XAxis type="number" domain={[0, 40]} tick={{ fill: '#64748b', fontSize: 10 }} />
        <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={110} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="value" name="Importance %" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
