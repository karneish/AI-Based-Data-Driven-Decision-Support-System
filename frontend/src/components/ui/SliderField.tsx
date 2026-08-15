interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  decimals?: number
  onChange: (value: number) => void
}

export default function SliderField({
  label, value, min, max, step = 1, unit = '', decimals = 0, onChange,
}: Props) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
        <span className="font-mono text-sm font-bold text-brand-300">{value.toFixed(decimals)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{ background: `linear-gradient(to right, #1b85f1 ${pct}%, #1e2d4a ${pct}%)` }}
      />
      <div className="flex justify-between text-xs text-slate-600 font-mono mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )
}
