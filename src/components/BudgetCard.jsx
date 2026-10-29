import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, Pencil, Target, X } from 'lucide-react'
import { currency } from '../utils/analytics'

export default function BudgetCard({ budget, spent, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(budget))
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const hasBudget = budget > 0
  const remaining = Math.max(budget - spent, 0)
  const exceeded = hasBudget && spent > budget
  const percent = hasBudget ? spent / budget * 100 : 0
  const progress = Math.min(percent, 100)

  const beginEdit = () => { setDraft(String(budget)); setError(''); setEditing(true) }
  const save = (event) => {
    event.preventDefault()
    if (!draft.trim() || !Number.isFinite(Number(draft)) || Number(draft) < 0 || Number(draft) > 1000000000) {
      setError('Enter an amount between RM 0 and RM 1,000,000,000.')
      return
    }
    if (onSave(Number(draft))) setEditing(false)
  }
  return <section className="budget-card" aria-label="Monthly spending budget">
    <div className="budget-header"><div className="budget-icon"><Target size={21}/></div><span className="budget-kicker">YOUR MONTHLY LIMIT</span><button className="budget-edit" onClick={beginEdit} aria-label="Edit monthly budget"><Pencil size={15}/></button></div>
    <div className="budget-body"><p className="budget-caption">Monthly budget</p><strong className="budget-amount" title={currency.format(budget)}>{currency.format(budget)}</strong><p className="budget-description">{hasBudget ? exceeded ? `${currency.format(spent - budget)} over your limit` : `${currency.format(remaining)} left to spend` : 'Set a limit to track your progress'}</p></div>
    <div className="budget-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Budget used"><div className={`budget-fill ${exceeded ? 'over' : ''}`} style={{ width: `${progress}%` }}/></div>
    <div className="budget-bottom"><span>{hasBudget ? `${Math.round(percent)}% used` : 'No budget yet'}</span><span>{currency.format(spent)} spent <ArrowUpRight size={14}/></span></div>
    {editing && <div className="budget-editor" role="dialog" aria-label="Edit monthly budget">
      <form onSubmit={save}><label htmlFor="budget-input">Monthly budget (RM)</label><div className="budget-editor-row"><input ref={inputRef} id="budget-input" type="number" min="0" max="1000000000" step="0.01" value={draft} onChange={e => {setDraft(e.target.value);setError('')}} onKeyDown={e => {if(e.key === 'Escape') setEditing(false)}} /><button type="submit" aria-label="Save budget"><Check size={19}/></button><button type="button" onClick={() => setEditing(false)} aria-label="Cancel budget editing"><X size={19}/></button></div>{error && <small role="alert">{error}</small>}<p>Set to RM 0 to turn off budget tracking.</p></form>
    </div>}
  </section>
}
