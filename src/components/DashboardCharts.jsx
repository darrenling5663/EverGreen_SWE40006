import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { amountText, currency } from '../utils/analytics'
import { CATEGORY_COLORS, categoryColor } from '../data/theme'
import { ArrowUpRight } from 'lucide-react'

function ChartTooltip({ active, payload, label, kind }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  const title = kind === 'category' ? (p.name || p.payload?.name) : (label || p.payload?.month)
  return <div className="chart-tooltip"><span className="tooltip-title">{title}</span><strong>{currency.format(p.value)}</strong></div>
}

export function MonthlyChart({ data, title = 'Monthly spending', subtitle = 'Your spending over the past six months' }) {
  const max = Math.max(0, ...data.map(item => item.total))
  const ticksMax = max ? Math.ceil(max / 100) * 100 : 100
  return <section className="panel chart-panel monthly-panel" aria-label="Monthly spending chart">
    <div className="panel-heading"><div><div className="eyebrow">SPENDING OVERVIEW</div><h2>{title}</h2><p>{subtitle}</p></div><span className="chart-chip">Last 6 months</span></div>
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 7, left: -13, bottom: 3 }} barCategoryGap="35%">
          <CartesianGrid vertical={false} stroke="#edf0f3" strokeDasharray="4 5" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#79838d', fontSize: 12, fontWeight: 600 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} domain={[0, ticksMax]} tick={{ fill: '#89949c', fontSize: 11 }} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(value%1000?1:0)}k` : value} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f6f3', radius: 8 }} />
          <Bar dataKey="total" maxBarSize={49} radius={[9,9,4,4]} isAnimationActive animationDuration={450}>
            {data.map((entry) => <Cell key={entry.key} fill={entry.current ? '#16825c' : entry.total ? '#76a8eb' : '#dce8ea'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="chart-footnote"><span className="dot dot-blue" /> Previous months <span className="dot dot-green" /> Current month</div>
  </section>
}

export function CategoryChart({ data, title = 'Where your money goes', subtitle = 'All-time category breakdown' }) {
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const activeName = hovered ?? selected
  const total = useMemo(() => data.reduce((sum,item) => sum+item.value, 0), [data])
  const active = data.find(item => item.name === activeName)
  const clear = () => setHovered(null)
  const amount = amountText(active?.value ?? total)
  const safeSize = amount.length > 19 ? 11 : amount.length > 14 ? 13 : amount.length > 11 ? 15 : 21
  return <section className="panel chart-panel category-panel" aria-label="Spending by category chart">
    <div className="panel-heading"><div><div className="eyebrow">YOUR CATEGORIES</div><h2>{title}</h2><p>{subtitle}</p></div><span className="chart-chip">{data.length} categories</span></div>
    {total > 0 ? <div className="category-layout">
      <div className="donut-shell" onMouseLeave={clear}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="72%" outerRadius="94%" paddingAngle={2.5} stroke="#fff" strokeWidth={3} isAnimationActive={false}
              onMouseEnter={(entry) => setHovered(entry.name)} onClick={(entry) => setSelected(current => current === entry.name ? null : entry.name)}>
              {data.map((item) => <Cell key={item.name} fill={categoryColor(item.name)} opacity={activeName && item.name !== activeName ? .32 : 1} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center" aria-live="polite">
          <span>{active ? active.name : 'TOTAL SPENT'}</span>
          <span className="donut-currency">RM</span>
          <svg className="donut-amount" viewBox="0 0 130 30" role="img" aria-label={`RM ${amount}`} preserveAspectRatio="xMidYMid meet">
            <text x="65" y="21.5" fontSize={safeSize} fontWeight="800" textAnchor="middle" fill="#162d26" textLength={amount.length > 9 ? 119 : undefined} lengthAdjust="spacingAndGlyphs">{amount}</text>
          </svg>
        </div>
      </div>
      <div className="category-legend" aria-label="Categories; hover or select to highlight in the chart">
        {data.map((item) => {
          const share = Math.round(item.value / total * 100)
          return <button key={item.name} type="button" className={`legend-item ${activeName === item.name ? 'selected' : ''}`} onMouseEnter={() => setHovered(item.name)} onMouseLeave={clear} onFocus={() => setHovered(item.name)} onBlur={clear} onClick={() => setSelected(selected === item.name ? null : item.name)} aria-pressed={selected === item.name}>
            <i style={{background: categoryColor(item.name)}} /><span className="legend-name">{item.name}</span><span className="legend-share">{share}%</span><small>{currency.format(item.value)}</small>
          </button>
        })}
      </div>
    </div> : <div className="chart-empty"><div className="empty-ring"/><h3>No spending to analyse yet</h3><p>Add an expense to see your category breakdown.</p></div>}
  </section>
}
