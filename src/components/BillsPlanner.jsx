import BillShockPanel from './BillShockPanel'
import { useMemo, useState } from 'react'
import { Plus, Check, Pencil, Trash2, CalendarClock, Repeat2, ReceiptText, X, CheckCircle2 } from 'lucide-react'
import { currency } from '../utils/analytics'
import { dueDate, monthKey, monthLabel } from '../utils/periods'
import { paymentMethods } from '../data/finance'

const blank = () => ({name:'',amount:'',category:'Bills & Utilities',dueDay:'1',paymentMethod:'Debit Card',bankName:'',merchant:''})
export default function BillsPlanner({ bills, add, update, remove, notify, preferences }) {
  const categories = [...new Set([...preferences.categories, ...bills.map(b=>b.category)].filter(Boolean))] 
  const banks = [...new Set([...preferences.banks, ...bills.map(b=>b.bankName)].filter(Boolean))]
  const [month,setMonth]=useState(monthKey(new Date()))
  const [editing,setEditing]=useState(null)
  const [draft,setDraft]=useState(blank)
  const [error,setError]=useState('')
  const sorted=useMemo(()=>[...bills].sort((a,b)=>a.dueDay-b.dueDay),[bills])
  const planned=bills.reduce((n,b)=>n+Number(b.amount||0),0)
  const paid=bills.filter(b=>(b.paidMonths||[]).includes(month))
  const paidAmount=paid.reduce((n,b)=>n+Number(b.amount||0),0)
  const openNew=()=>{setEditing('new');setDraft(blank());setError('')}
  const openEdit=b=>{setEditing(b.id);setDraft({...blank(),...b, amount:String(b.amount), dueDay:String(b.dueDay)});setError('')}
  const submit=e=>{
    e.preventDefault()
    const amount=Number(draft.amount), day=Number(draft.dueDay)
    if (!draft.name.trim() || !Number.isFinite(amount) || amount<=0 || !Number.isInteger(day) || day<1 || day>31) {setError('Enter a bill name, an amount above RM 0 and a due day from 1 to 31.');return}
    const values={name:draft.name.trim(),amount:Math.round(amount*100)/100,category:draft.category,paymentMethod:draft.paymentMethod,dueDay:day,bankName:draft.bankName||'',merchant:draft.merchant||''}
    if(editing==='new')add({...values,paidMonths:[]})
    else update(editing, values)
    setEditing(null);notify(editing==='new'?'Monthly bill added':'Bill updated')
  }
  const toggle=b=>{const current=b.paidMonths||[], next=current.includes(month)?current.filter(m=>m!==month):[...current,month];update(b.id,{paidMonths:next});notify(current.includes(month)?'Bill marked unpaid':'Bill marked paid for this month')}
  const del=b=>{if(window.confirm(`Delete the bill “${b.name}”?`)){remove(b.id);notify('Bill removed')}}
  return <div className="page-sections">
    <section className="section-intro finance-intro"><div><span className="eyebrow">RECURRING PAYMENTS</span><h2>Never lose track of a monthly bill.</h2><p>Phone data, subscriptions, rent, electricity and anything you pay regularly.</p></div><button className="primary-action" onClick={openNew}><Plus size={18}/> Add recurring bill</button></section>
    <section className="bills-metrics"><div className="bill-summary bill-summary-blue"><span>Monthly planned bills</span><strong>{currency.format(planned)}</strong><small>{bills.length} recurring items</small></div><div className="bill-summary bill-summary-green"><span>Marked paid in {monthLabel(month)}</span><strong>{currency.format(paidAmount)}</strong><small>{paid.length} of {bills.length} bills</small></div><div className="bill-summary bill-summary-coral"><span>Still to pay</span><strong>{currency.format(planned-paidAmount)}</strong><small>Based on your monthly checklist</small></div></section>
    <BillShockPanel bills={bills} update={update} month={month} notify={notify} />
    <section className="panel bills-panel"><div className="finance-panel-head"><div><span className="eyebrow">MONTHLY CHECKLIST</span><h3>Upcoming & recurring bills</h3><p>Track which bills you have paid each month.</p></div><label className="finance-month-control">Review month<input aria-label="Choose bill month" type="month" value={month} onChange={e=>/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value) && setMonth(e.target.value)}/></label></div>
      {sorted.length?<div className="bill-list">{sorted.map(b=>{const isPaid=(b.paidMonths||[]).includes(month);return <article className={`bill-row ${isPaid?'bill-paid':''}`} key={b.id}><span className="bill-icon"><ReceiptText size={23}/></span><div className="bill-detail"><strong>{b.name}</strong><small>Due {dueDate(month,b.dueDay)} · {b.category}</small><small>{[b.paymentMethod,b.bankName,b.merchant].filter(Boolean).join(' · ')}</small></div><div className="bill-amount"><strong>{currency.format(b.amount)}</strong><span>every month</span></div><div className="bill-actions"><button className={`bill-pay ${isPaid?'paid':''}`} onClick={()=>toggle(b)} aria-pressed={isPaid}>{isPaid?<><CheckCircle2 size={17}/> Paid</>:<><Check size={17}/> Mark paid</>}</button><button className="icon-button" title="Edit bill" aria-label={`Edit ${b.name}`} onClick={()=>openEdit(b)}><Pencil size={17}/></button><button className="icon-button danger-icon" title="Delete bill" aria-label={`Delete ${b.name}`} onClick={()=>del(b)}><Trash2 size={17}/></button></div></article>})}</div>:<div className="finance-empty"><CalendarClock size={36}/><h3>No recurring bills yet</h3><p>Add rent, mobile data or monthly subscriptions to start tracking.</p><button className="secondary-action" onClick={openNew}>Add your first bill</button></div>}
    </section>
    <div className="finance-note"><Repeat2 size={19}/><p><strong>How bill tracking works:</strong> Marking a bill paid updates this checklist only. To include the payment in your actual spending totals, record it separately as an expense. This avoids duplicate expenses from scheduled bills.</p></div>
    {editing!==null && <div className="finance-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}><div className="finance-dialog" role="dialog" aria-modal="true" aria-labelledby="bill-dialog"><div className="finance-dialog-title"><div><span className="eyebrow">BILLS PLANNER</span><h2 id="bill-dialog">{editing==='new'?'Add a recurring bill':'Edit recurring bill'}</h2></div><button aria-label="Close" className="icon-button" onClick={()=>setEditing(null)}><X size={21}/></button></div><form onSubmit={submit} className="finance-form"><label>Bill name<input autoFocus maxLength={80} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="e.g. Rent, Maxis, Netflix" /></label><div className="finance-form-two"><label>Monthly amount (RM)<input type="number" min="0.01" step="0.01" value={draft.amount} onChange={e=>setDraft({...draft,amount:e.target.value})}/></label><label>Due day (1–31)<input type="number" min="1" max="31" step="1" value={draft.dueDay} onChange={e=>setDraft({...draft,dueDay:e.target.value})}/></label></div><div className="finance-form-two"><label>Category<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Usually paid using<select value={draft.paymentMethod} onChange={e=>setDraft({...draft,paymentMethod:e.target.value})}>{paymentMethods.map(p=><option key={p}>{p}</option>)}</select></label></div><div className="finance-form-two"><label>Bank or wallet (optional)<input list="bill-bank-list" maxLength={60} value={draft.bankName||''} onChange={e=>setDraft({...draft,bankName:e.target.value})} placeholder="e.g. Maybank"/><datalist id="bill-bank-list">{banks.map(b=><option key={b} value={b}/>)}</datalist></label><label>Provider / brand (optional)<input maxLength={60} value={draft.merchant||''} onChange={e=>setDraft({...draft,merchant:e.target.value})} placeholder="e.g. Maxis or Netflix" /></label></div>{error&&<p className="finance-error" role="alert">{error}</p>}<div className="finance-form-actions"><button className="secondary-action" type="button" onClick={()=>setEditing(null)}>Cancel</button><button className="primary-action" type="submit"><Check size={18}/> Save bill</button></div></form></div></div>}
  </div>
}
