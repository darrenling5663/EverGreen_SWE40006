import { useEffect, useRef, useState } from 'react'
import { Check, X, Wallet, Info } from 'lucide-react'
import { paymentMethods } from '../data/finance'

const todayLocal = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
}
const blank = () => ({ description: '', amount: '', category: '', date: todayLocal(), notes: '', paymentMethod: 'Debit Card', merchant: '', bankName: '', tags: '' })
const focusables = 'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export default function ExpenseModal({ open, expense, onClose, onSave, preferences }) {
  const categories = [...new Set([...preferences.categories, ...(expense?.category ? [expense.category] : [])])]
  const banks = [...new Set([...preferences.banks, ...(expense?.bankName ? [expense.bankName] : [])])]
  const merchants = [...new Set([...preferences.merchants, ...(expense?.merchant ? [expense.merchant] : [])])]
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const node = useRef(null)
  const initialInput = useRef(null)
  const previousFocus = useRef(null)
  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement
    setForm(expense ? { description: expense.description, amount: String(expense.amount), category: expense.category, date: expense.date, notes: expense.notes || '', paymentMethod: expense.paymentMethod || 'Others', merchant: expense.merchant || '', bankName: expense.bankName || '', tags: Array.isArray(expense.tags) ? expense.tags.join(', ') : expense.tags || '' } : blank())
    setErrors({})
    const raf = requestAnimationFrame(() => initialInput.current?.focus())
    const keydown = e => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'Tab') {
        const elements = Array.from(node.current?.querySelectorAll(focusables) || [])
        if (!elements.length) return
        const first = elements[0], last = elements[elements.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', keydown); document.body.style.overflow = old; previousFocus.current?.focus?.() }
  }, [open, expense, onClose])
  if (!open) return null

  const update = (name, value) => { setForm(prev => ({...prev,[name]:value})); if (errors[name]) setErrors(prev => ({...prev,[name]:''})) }
  const submit = event => {
    event.preventDefault()
    const next = {}
    const number = Number(form.amount)
    if (!form.description.trim()) next.description = 'Enter a description for this expense.'
    if (!form.amount.trim() || !Number.isFinite(number) || number <= 0) next.amount = 'Enter an amount greater than RM 0.'
    if (!categories.includes(form.category)) next.category = 'Select an expense category.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || Number.isNaN(new Date(`${form.date}T00:00:00`).getTime())) next.date = 'Select a valid date.'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({ description: form.description.trim(), amount: Math.round(number * 100) / 100, category: form.category, date: form.date, notes: form.notes.trim(), paymentMethod: form.paymentMethod, bankName: form.bankName.trim(), merchant: form.merchant.trim(), tags: [...new Set(form.tags.split(',').map(t=>t.trim()).filter(Boolean))].slice(0,8) })
  }
  const field = (name, label, child, help) => <label className={`form-field ${errors[name] ? 'has-error' : ''}`}><span className="field-label">{label}</span>{child}{help && <small className="field-help">{help}</small>}{errors[name] && <small className="field-error" role="alert">{errors[name]}</small>}</label>
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="expense-dialog-title" ref={node}>
      <div className="modal-top"><div className="modal-symbol"><Wallet size={23}/></div><button onClick={onClose} className="modal-close" aria-label="Close expense form"><X size={20}/></button></div>
      <div className="modal-copy"><span className="eyebrow">{expense ? 'EDIT TRANSACTION' : 'NEW TRANSACTION'}</span><h2 id="expense-dialog-title">{expense ? 'Edit expense' : 'Add an expense'}</h2><p>Keep a clear record of where your money goes.</p></div>
      <form onSubmit={submit} noValidate>
        <div className="form-layout">
          {field('description','Expense name',<input ref={initialInput} className="field-input" value={form.description} onChange={e=>update('description',e.target.value)} maxLength={120} placeholder="e.g. Lunch with friends" />, 'A short name you will recognise later.')}
          <div className="form-row">
            {field('amount','Amount (MYR)',<div className="amount-field"><span>RM</span><input type="number" step="0.01" min="0.01" className="field-input" inputMode="decimal" value={form.amount} onChange={e=>update('amount',e.target.value)} placeholder="0.00" /></div>)}
            {field('date','Date',<input type="date" className="field-input" value={form.date} onChange={e=>update('date',e.target.value)} />)}
          </div>
          {field('category','Category',<select className="field-input" value={form.category} onChange={e=>update('category',e.target.value)}><option value="">Select a category</option>{categories.map(item=><option key={item} value={item}>{item}</option>)}</select>)}
          {field('paymentMethod','Payment method',<select className="field-input" value={form.paymentMethod} onChange={e=>update('paymentMethod',e.target.value)}>{paymentMethods.map(item=><option key={item} value={item}>{item}</option>)}</select>, 'Cash, card, Touch ‘n Go, bank transfer or other.')}
          {field('merchant',<>Merchant / brand <span className="optional">(optional)</span></>,<><input list="merchant-options" className="field-input" value={form.merchant} maxLength={60} onChange={e=>update('merchant',e.target.value)} placeholder="e.g. Grab or Shopee" /><datalist id="merchant-options">{merchants.map(item=><option key={item} value={item} />)}</datalist></>, 'Use a saved name or type a new brand.') }
          {field('bankName',<>Bank / wallet <span className="optional">(optional)</span></>,<><input list="bank-options" className="field-input" value={form.bankName} maxLength={60} onChange={e=>update('bankName',e.target.value)} placeholder="e.g. Maybank" /><datalist id="bank-options">{banks.map(item=><option key={item} value={item} />)}</datalist></>, 'Optional provider name only — do not enter account details.') }
          {field('tags',<>Tags <span className="optional">(optional)</span></>,<input className="field-input" value={form.tags} maxLength={180} onChange={e=>update('tags',e.target.value)} placeholder="e.g. family, work, travel" />, 'Separate tags with commas to make searching easier.') }
          {field('notes',<>Notes <span className="optional">(optional)</span></>,<textarea rows={3} className="field-input" value={form.notes} maxLength={400} onChange={e=>update('notes',e.target.value)} placeholder="Add extra details if you like..." />)}
        </div>
        <div className="form-tip"><Info size={17}/><span>Expenses are saved in your browser on this device.</span></div>
        <div className="modal-footer"><button type="button" className="secondary-action" onClick={onClose}>Cancel</button><button type="submit" className="primary-action"><Check size={18}/>{expense ? 'Save changes' : 'Save expense'}</button></div>
      </form>
    </div>
  </div>
}
