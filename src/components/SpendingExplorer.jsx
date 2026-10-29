import { useMemo, useState } from 'react'
import { CalendarDays, Clock3, CalendarRange, CalendarCheck, WalletCards, ArrowRight, BadgeCheck, CreditCard } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { currency, formatDate } from '../utils/analytics'
import { dateKey, monthKey, monthLabel, periodSummary, dailyBreakdown, paymentBreakdown } from '../utils/periods'
import { paymentColors } from '../data/finance'
import { CATEGORY_COLORS, categoryColor } from '../data/theme'

const tabs = [
  { id:'today', label:'Today', icon: Clock3 }, { id:'week', label:'This week', icon: CalendarRange },
  { id:'month', label:'This month', icon: CalendarDays }, { id:'year', label:'This year', icon: CalendarCheck },
]
const dayName = date => new Intl.DateTimeFormat('en-MY', { weekday:'long', month:'long', day:'numeric' }).format(date)
function periodsNow(expenses, now) { return periodSummary(expenses, now) }

export default function SpendingExplorer({ expenses, onAdd, onEdit, onNavigate }) {
  const now = useMemo(() => new Date(), [])
  const [selectedMonth, setSelectedMonth] = useState(monthKey(now))
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [method, setMethod] = useState('All')
  const metrics = useMemo(() => periodsNow(expenses,now), [expenses, now])
  const monthly = useMemo(() => periodSummary(expenses,now,selectedMonth), [expenses,now,selectedMonth])
  const methods = useMemo(() => paymentBreakdown(monthly.selected), [monthly.selected])
  const categories = useMemo(() => {
    const totals = new Map()
    monthly.selected.forEach(item => totals.set(item.category, (totals.get(item.category) || 0) + Number(item.amount || 0)))
    return [...totals].map(([name,value]) => ({name,value})).sort((a,b)=>b.value-a.value)
  }, [monthly.selected])
  const visible = useMemo(() => monthly.selected.filter(item => method === 'All' || (item.paymentMethod || 'Others') === method), [monthly.selected,method])
  const selectedTotal = visible.reduce((n,item)=>n+Number(item.amount),0)
  const days = useMemo(() => dailyBreakdown(visible, selectedMonth),[visible,selectedMonth])
  const selectedLabel = monthLabel(selectedMonth)
  const activeMetric = tabs.find(item => item.id === selectedPeriod)
  const activeValue = metrics[selectedPeriod]
  const recent = [...visible].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7)
  return <div className="page-sections explorer-page">
    <section className="explorer-hero panel">
      <div><span className="eyebrow">SPENDING CALENDAR</span><h2>Every ringgit. Every moment.</h2><p>Go from today's expenses to any month of the year — and see exactly how you paid.</p></div>
      <div className="explorer-date"><CalendarDays size={21}/><span>{dayName(now)}</span></div>
    </section>
    <section className="period-cards" aria-label="Spending by period">
      {tabs.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={`period-card ${selectedPeriod === id ? 'is-selected' : ''}`} onClick={()=>setSelectedPeriod(id)} aria-pressed={selectedPeriod===id}><span className="period-icon"><Icon size={21}/></span><span className="period-label">{label}</span><strong>{currency.format(metrics[id])}</strong><small>{metrics.counts[id]} transaction{metrics.counts[id]===1?'':'s'}</small></button>)}
    </section>
    <div className="explorer-summary" role="status"><BadgeCheck size={19}/><span><strong>{activeMetric.label}:</strong> {currency.format(activeValue)} in recorded spending</span></div>
    <section className="panel explorer-chart-panel">
      <div className="explorer-panel-top"><div><span className="eyebrow">MONTH-BY-MONTH</span><h3>Explore a specific month</h3><p>Choose January, April, October — or any other month.</p></div><div className="month-controls"><label>Choose month <input aria-label="Choose spending month" type="month" value={selectedMonth} onChange={e=>{if (/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value)) {setSelectedMonth(e.target.value);setMethod('All')}}} /></label></div></div>
      <div className="month-overview"><div className="month-total"><span>TOTAL FOR {selectedLabel.toUpperCase()}</span><strong>{currency.format(monthly.selectedTotal)}</strong><small>{monthly.selectedCount} recorded transactions</small></div><div className="month-methods"><span>PAYMENT METHODS</span><strong>{methods.length}</strong><small>Used this month</small></div><div className="month-filter"><label>Payment method<select value={method} onChange={e=>setMethod(e.target.value)}><option value="All">All payment methods</option>{methods.map(m=><option value={m.name} key={m.name}>{m.name}</option>)}</select></label></div></div>
      <div className="explorer-chart-wrap" aria-label={`Daily spending chart for ${selectedLabel}`}>
        {visible.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={days} margin={{left:-14,right:12,top:12,bottom:0}}><CartesianGrid vertical={false} stroke="#edf1f3" strokeDasharray="4 5"/><XAxis dataKey="day" tickLine={false} axisLine={false} interval={days.length>20?3:1} tick={{fill:'#77879a',fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#81909d',fontSize:11}} tickFormatter={n=>n>=1000?`${(n/1000).toFixed(1)}k`:n}/><Tooltip formatter={value=>currency.format(value)} labelFormatter={day=>`${day} ${selectedLabel}`} contentStyle={{borderRadius:14,border:'1px solid #e7edf3'}}/><Bar dataKey="total" name="Spending" fill="#4a82df" radius={[6,6,2,2]} maxBarSize={24}/></BarChart></ResponsiveContainer> : <div className="explorer-empty"><CalendarDays size={28}/><strong>No expenses for this selection</strong><span>Choose another month or payment method.</span></div>}
      </div>
    </section>
    <section className="explorer-bottom-grid">
      <article className="panel explainer-card"><div className="panel-heading"><div><div className="eyebrow">PAYMENT MIX</div><h2>How you paid</h2><p>From cash to eWallet, debit and credit cards</p></div></div><div className="payment-bars">{methods.length?methods.map(item=><div className="payment-row" key={item.name}><div className="payment-row-head"><span><i style={{background:paymentColors[item.name] || '#94a3b8'}} />{item.name}</span><strong>{currency.format(item.value)}</strong></div><div className="payment-bar-track"><span style={{width:`${monthly.selectedTotal?100*item.value/monthly.selectedTotal:0}%`,background:paymentColors[item.name]||'#94a3b8'}} /></div></div>):<p className="muted-note">No payment methods recorded for this month.</p>}</div></article>
      <article className="panel explainer-card"><div className="panel-heading"><div><div className="eyebrow">CATEGORY MIX</div><h2>What you spent on</h2><p>Categories within {selectedLabel}</p></div></div><div className="payment-bars">{categories.length?categories.slice(0,8).map(item=><div className="payment-row" key={item.name}><div className="payment-row-head"><span><i style={{background:categoryColor(item.name)}} />{item.name}</span><strong>{currency.format(item.value)}</strong></div><div className="payment-bar-track"><span style={{width:`${monthly.selectedTotal?100*item.value/monthly.selectedTotal:0}%`,background:categoryColor(item.name)}} /></div></div>):<p className="muted-note">No categories recorded this month.</p>}</div></article>
    </section>
    <section className="panel explorer-recent explorer-recent-wide"><div className="panel-heading"><div><div className="eyebrow">MONTHLY ACTIVITY</div><h2>{method==='All'?'Recent spending':method}</h2><p>{currency.format(selectedTotal)} in this view</p></div></div><div className="explorer-list">{recent.length?recent.map(item=><button type="button" className="explorer-entry" onClick={()=>onEdit(item)} key={item.id}><i style={{background:categoryColor(item.category)}} /><span><strong>{item.description}</strong><small>{formatDate(item.date)} · {item.paymentMethod || 'Others'}</small></span><b>{currency.format(item.amount)}</b></button>):<p className="muted-note">No transactions to display.</p>}</div><button className="text-action" onClick={onNavigate}>View all transactions <ArrowRight size={17}/></button></section>
  </div>
}
