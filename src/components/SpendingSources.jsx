import { Building2, Store, ArrowUpRight } from 'lucide-react'
import { currency } from '../utils/analytics'

function totalsFor(expenses, key) {
  const totals = new Map()
  for (const expense of expenses) {
    const name = String(expense[key] || '').trim()
    const amount = Number(expense.amount)
    if (!name || !Number.isFinite(amount) || amount <= 0) continue
    totals.set(name, (totals.get(name) || 0) + amount)
  }
  return [...totals].map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount).slice(0, 5)
}

function SourceCard({ title, subtitle, icon: Icon, rows, tone }) {
  const max = rows[0]?.amount || 0
  return <article className={`panel sources-card sources-${tone}`}>
    <div className="sources-heading"><span className="sources-icon"><Icon size={21}/></span><div><span className="eyebrow">SMARTER SPENDING</span><h3>{title}</h3><p>{subtitle}</p></div></div>
    {rows.length ? <div className="sources-items">{rows.map(row=><div key={row.name} className="sources-entry"><div className="sources-line"><strong>{row.name}</strong><b>{currency.format(row.amount)}</b></div><div className="sources-track"><span style={{ width: `${100 * row.amount / max}%` }}/></div></div>)}</div> : <div className="sources-empty"><ArrowUpRight size={20}/><p>No {tone === 'blue' ? 'bank or wallet' : 'merchant'} names recorded in this view yet. Add them while entering expenses to build your breakdown.</p></div>}
  </article>
}

export default function SpendingSources({ expenses }) {
  return <section className="sources-section"><div className="sources-section-title"><h2>How and where you spend</h2><p>Insights calculated from the transactions currently shown above. Add banks and brands to make this more useful.</p></div><div className="sources-grid"><SourceCard title="Banks & wallets" subtitle="Spending by provider" icon={Building2} tone="blue" rows={totalsFor(expenses, 'bankName')} /><SourceCard title="Merchants & brands" subtitle="Where your purchases happened" icon={Store} tone="violet" rows={totalsFor(expenses, 'merchant')} /></div></section>
}
