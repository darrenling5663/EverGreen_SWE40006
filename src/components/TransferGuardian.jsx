import { useState } from 'react'
import { ArrowLeftRight, ShieldCheck, Plus, CheckCircle2, Trash2, Sparkles, AlertCircle, X, Check } from 'lucide-react'
import { currency, formatDate } from '../utils/analytics'
import { dateKey } from '../utils/periods'
import { getTransferCandidates, validDate, money } from '../utils/financeIntelligence'

const empty = () => ({ kind:'Own-account transfer', from:'', to:'', amount:'', date:dateKey(new Date()), notes:'' })
const kinds = ['Own-account transfer','eWallet top-up','Credit card repayment','Savings transfer','Other internal movement']
export default function TransferGuardian({ expenses, transfers, add, remove, expenseRemove, banks, notify }) {
  const candidates = getTransferCandidates(expenses,transfers)
  const [open,setOpen] = useState(false)
  const [review,setReview] = useState(null)
  const [draft,setDraft] = useState(empty)
  const [error,setError] = useState('')
  const total = transfers.reduce((sum,item) => sum + (Number(item.amount)||0),0)
  const start = expense => {
    setReview(expense || null)
    setDraft(expense ? { ...empty(), amount:String(expense.amount),date:expense.date,from:expense.bankName||'', notes: expense.description } : empty())
    setOpen(true);setError('')
  }
  const submit=e=>{
    e.preventDefault()
    const amount=Number(draft.amount)
    if (!draft.from.trim() || !draft.to.trim() || draft.from.trim().toLowerCase()===draft.to.trim().toLowerCase()) { setError('Enter two different source and destination accounts or wallets.');return }
    if (!Number.isFinite(amount) || amount<=0 || amount>1e11 || !validDate(draft.date)) {setError('Enter a positive amount and valid transfer date.');return}
    const payload={kind:draft.kind,from:draft.from.trim(),to:draft.to.trim(),amount:money(amount),date:draft.date,notes:draft.notes.trim(),originalExpenseId:review?.id||null}
    if (review && !window.confirm(`Reclassify “${review.description}” as a transfer? It will be removed from spending totals.`))return
    add(payload)
    if (review) expenseRemove(review.id)
    notify(review ? 'Expense reclassified as an internal transfer' : 'Internal transfer recorded')
    setOpen(false)
  }
  const del=item=> {if(window.confirm('Remove this transfer record? This will not recreate any previously reclassified expense.')){remove(item.id);notify('Transfer record removed')}}
  return <div className="page-sections v11-page">
    <section className="v11-intro"><div><span className="eyebrow">SMART TRANSFER GUARDIAN</span><h2>Move money without counting it twice.</h2><p>Keep your Maybank, CIMB, Touch ’n Go and other self-transfers separate from real purchases.</p></div><button className="primary-action" onClick={()=>start(null)}><Plus size={18}/> Record transfer</button></section>
    <div className="v11-metrics">
      <div className="v11-metric"><span><ArrowLeftRight size={21}/> Transfers recorded</span><strong>{transfers.length}</strong><small>Internal money movements only</small></div>
      <div className="v11-metric"><span><ShieldCheck size={21}/> Kept out of spending</span><strong>{currency.format(total)}</strong><small>Not added to expense charts</small></div>
      <div className="v11-metric v11-metric-accent"><span><Sparkles size={21}/> Needs your review</span><strong>{candidates.length}</strong><small>Possible transfers found in expenses</small></div>
    </div>
    <section className="panel v11-panel"><header className="v11-panel-head"><div><span className="eyebrow">REVIEW FIRST</span><h3>Possible transfers in expenses</h3><p>Keyword suggestions only. No automatic changes are made without your confirmation.</p></div></header>
      {candidates.length ? <div className="v11-record-list">{candidates.map(item=><div key={item.id} className="v11-record"><span className="v11-round-icon orange"><AlertCircle size={20}/></span><div className="v11-record-main"><strong>{item.description}</strong><small>{formatDate(item.date)} · {item.bankName || item.paymentMethod || 'Unspecified account'}</small></div><strong className="v11-amount">{currency.format(item.amount)}</strong><button className="v11-pill primary" onClick={()=>start(item)}>Review & reclassify</button></div>)}</div> : <div className="v11-empty-inline"><CheckCircle2 size={22}/><span>No obvious transfer descriptions to review. You can still record internal transfers manually.</span></div>}
    </section>
    <section className="panel v11-panel"><header className="v11-panel-head"><div><span className="eyebrow">OWN ACCOUNTS</span><h3>Transfer history</h3><p>Money moving between your own accounts is not income or an expense.</p></div></header>
      {transfers.length ? <div className="v11-record-list">{[...transfers].sort((a,b)=>b.date.localeCompare(a.date)).map(item=><div key={item.id} className="v11-record"><span className="v11-round-icon blue"><ArrowLeftRight size={20}/></span><div className="v11-record-main"><strong>{item.from} → {item.to}</strong><small>{item.kind} · {formatDate(item.date)}{item.notes ? ` · ${item.notes}` : ''}</small></div><strong className="v11-amount">{currency.format(item.amount)}</strong><button className="icon-button danger-icon" onClick={()=>del(item)} aria-label={`Delete transfer ${item.from} to ${item.to}`}><Trash2 size={17}/></button></div>)}</div> : <div className="v11-empty"><ArrowLeftRight size={34}/><h3>No transfers recorded yet</h3><p>Try adding a transfer from Maybank to Touch ’n Go.</p><button className="secondary-action" onClick={()=>start(null)}>Add a transfer</button></div>}
    </section>
    <div className="finance-note"><ShieldCheck size={20}/><p><strong>Why this matters:</strong> A RM100 top-up from your bank to your own eWallet shouldn't become RM100 of expenses. Only the actual purchases you make with that money should count. Suggested reclassification is manual and never connects to your bank.</p></div>
    {open&&<div className="finance-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setOpen(false)}><div className="finance-dialog" role="dialog" aria-modal="true" aria-labelledby="v11-transfer-title"><div className="finance-dialog-title"><div><span className="eyebrow">MONEY MOVEMENT</span><h2 id="v11-transfer-title">{review?'Review a possible transfer':'Record internal transfer'}</h2></div><button className="icon-button" onClick={()=>setOpen(false)} aria-label="Close"><X size={20}/></button></div><form className="finance-form" onSubmit={submit}><label>Transfer type<select value={draft.kind} onChange={e=>setDraft({...draft,kind:e.target.value})}>{kinds.map(k=><option key={k}>{k}</option>)}</select></label><div className="finance-form-two"><label>From bank / account<input autoFocus list="v11-transfer-banks" maxLength={80} placeholder="Maybank debit" value={draft.from} onChange={e=>setDraft({...draft,from:e.target.value})}/></label><label>To bank / account<input list="v11-transfer-banks" maxLength={80} placeholder="Touch ’n Go eWallet" value={draft.to} onChange={e=>setDraft({...draft,to:e.target.value})}/></label></div><datalist id="v11-transfer-banks">{banks.map(bank=><option key={bank} value={bank}/>)}</datalist><div className="finance-form-two"><label>Amount (RM)<input type="number" min="0.01" max="100000000000" step="0.01" value={draft.amount} onChange={e=>setDraft({...draft,amount:e.target.value})}/></label><label>Date<input type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label></div><label>Reference / note (optional)<input maxLength={140} placeholder="Own account movement" value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label>{review&&<p className="v11-help">This will remove the linked expense from spending totals and save a separate transfer record. Review carefully before confirming.</p>}{error&&<p className="finance-error" role="alert">{error}</p>}<div className="finance-form-actions"><button type="button" className="secondary-action" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-action" type="submit"><Check size={18}/> {review?'Confirm reclassification':'Save transfer'}</button></div></form></div></div>}
  </div>
}
