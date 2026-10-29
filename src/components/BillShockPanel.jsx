import { useState } from 'react'
import { Activity, AlertTriangle, BadgeCheck, Pencil, X, Check } from 'lucide-react'
import { currency } from '../utils/analytics'
import { getBillChanges, money } from '../utils/financeIntelligence'

export default function BillShockPanel({ bills, update, month, notify }) {
  const [editing,setEditing]=useState(null)
  const [amount,setAmount]=useState('')
  const [error,setError]=useState('')
  const changes=getBillChanges(bills,month)
  const warnings=changes.filter(item=>item.warning)
  const open=bill=>{setEditing(bill);setAmount(bill.actualAmounts?.[month] === undefined ? String(bill.amount) : String(bill.actualAmounts[month]));setError('')}
  const submit=e=>{
    e.preventDefault();const value=Number(amount)
    if (amount.trim()===''||!Number.isFinite(value)||value<0||value>1e11){setError('Enter a valid non-negative actual bill amount in RM.');return}
    update(editing.id,{actualAmounts:{...editing.actualAmounts,[month]:money(value)}})
    setEditing(null);notify('Actual bill amount saved — shock detector updated')
  }
  return <section className="panel v11-panel v11-bill-panel">
    <header className="v11-panel-head"><div><span className="eyebrow">BILL SHOCK DETECTOR</span><h3>Catch unexpected bill increases.</h3><p>Record the real amount charged each month and compare it to your last recorded month or planned amount.</p></div><span className={`v11-alert-count ${warnings.length?'warn':''}`}><Activity size={17}/>{warnings.length} alert{warnings.length===1?'':'s'}</span></header>
    {warnings.length>0?<div className="v11-warning-list">{warnings.map(item=><div key={item.id} className="v11-warning"><AlertTriangle size={23}/><div><strong>{item.name} is up {item.percent.toFixed(1)}%</strong><p>{currency.format(item.baseline)} → {currency.format(item.current)} (+{currency.format(item.delta)}) vs {item.baselineLabel}.</p></div></div>)}</div>:<div className="v11-empty-inline"><BadgeCheck size={22}/><span>No significant price increases detected for this month. Alerts require actual amounts that you've recorded.</span></div>}
    <div className="v11-bill-lines">{bills.map(b=>{const actual=b.actualAmounts?.[month];return <div className="v11-bill-line" key={b.id}><div><strong>{b.name}</strong><small>Planned: {currency.format(b.amount)} · Actual: {actual===undefined?'Not entered':currency.format(actual)}</small></div><button className="v11-pill" onClick={()=>open(b)}><Pencil size={15}/> {actual===undefined?'Enter actual':'Edit actual'}</button></div>})}</div>
    <p className="v11-help">Alert rule: an actual bill rises by at least RM10 and 15% versus the last actual amount (or the planned amount when there is no history). These amounts do not automatically become expense transactions.</p>
    {editing&&<div className="finance-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><div className="finance-dialog" role="dialog" aria-modal="true" aria-labelledby="v11-bill-actual"><div className="finance-dialog-title"><div><span className="eyebrow">ACTUAL BILL CHARGE</span><h2 id="v11-bill-actual">{editing.name}</h2><p>Record the amount billed in {month}.</p></div><button className="icon-button" onClick={()=>setEditing(null)} aria-label="Close"><X size={20}/></button></div><form className="finance-form" onSubmit={submit}><label>Actual amount charged (RM)<input autoFocus type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/></label>{error&&<p className="finance-error" role="alert">{error}</p>}<div className="finance-form-actions"><button className="secondary-action" type="button" onClick={()=>setEditing(null)}>Cancel</button><button className="primary-action" type="submit"><Check size={18}/> Save charge</button></div></form></div></div>}
  </section>
}
