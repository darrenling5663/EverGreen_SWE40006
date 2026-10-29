import { ArrowDownUp, Pencil, Search, SlidersHorizontal, Trash2, ReceiptText, Plus } from 'lucide-react'
import CategoryBadge from './CategoryBadge'
import { paymentMethods } from '../data/finance'
import { currency, formatDate } from '../utils/analytics'

export default function ExpenseTable({ expenses, onEdit, onDelete, search = '', setSearch, category = 'All', setCategory, sort = 'date-desc', setSort, paymentFilter = 'All', setPaymentFilter, bankFilter = 'All', setBankFilter, bankOptions = [], categories = [], compact = false, onAdd }) {
  const hasFilters = !!search || category !== 'All' || paymentFilter !== 'All' || bankFilter !== 'All'
  return <div className="expense-block">
    {!compact && <div className="table-toolbar">
      <label className="search-wrap"><Search size={18}/><span className="sr-only">Search expenses</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search names, brands, banks, tags..." /></label>
      <div className="table-filters">
        <label className="select-wrap"><SlidersHorizontal size={17}/><span className="sr-only">Filter category</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="All">All categories</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="select-wrap"><span className="sr-only">Payment method</span><select value={paymentFilter} onChange={e=>setPaymentFilter(e.target.value)}><option value="All">All payments</option>{paymentMethods.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
        <label className="select-wrap"><span className="sr-only">Bank or wallet</span><select value={bankFilter} onChange={e=>setBankFilter(e.target.value)}><option value="All">All banks / wallets</option>{bankOptions.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
        <label className="select-wrap"><ArrowDownUp size={17}/><span className="sr-only">Sort transactions</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="amount-desc">Highest amount</option><option value="amount-asc">Lowest amount</option></select></label>
      </div>
    </div>}
    {expenses.length ? <>
      <div className="desktop-table"><table><thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th className="amount-column">AMOUNT</th><th className="action-column">ACTIONS</th></tr></thead><tbody>
        {expenses.map(exp => <tr key={exp.id}><td className="table-description"><span className="transaction-avatar" aria-hidden="true"><ReceiptText size={18}/></span><div><strong>{exp.description}</strong><small title={[exp.merchant, exp.bankName, exp.paymentMethod].filter(Boolean).join(' · ')}>{[exp.merchant, exp.paymentMethod || 'Others', exp.bankName].filter(Boolean).join(' · ')}</small></div></td><td><CategoryBadge category={exp.category}/></td><td className="table-date">{formatDate(exp.date)}</td><td className="table-amount" title={currency.format(exp.amount)}>{currency.format(exp.amount)}</td><td><div className="row-actions"><button className="icon-button" onClick={() => onEdit(exp)} title={`Edit ${exp.description}`} aria-label={`Edit ${exp.description}`}><Pencil size={17}/></button><button className="icon-button delete" onClick={() => onDelete(exp)} title={`Delete ${exp.description}`} aria-label={`Delete ${exp.description}`}><Trash2 size={17}/></button></div></td></tr>)}
      </tbody></table></div>
      <div className="mobile-transactions">{expenses.map(exp => <article className="mobile-transaction" key={exp.id}><div className="mobile-transaction-top"><div><strong>{exp.description}</strong><span>{formatDate(exp.date)} · {[exp.merchant, exp.paymentMethod || 'Others', exp.bankName].filter(Boolean).join(' · ')}</span></div><b>{currency.format(exp.amount)}</b></div><div className="mobile-transaction-foot"><CategoryBadge category={exp.category}/><div className="row-actions"><button className="icon-button" onClick={() => onEdit(exp)} aria-label={`Edit ${exp.description}`}><Pencil size={17}/></button><button className="icon-button delete" onClick={() => onDelete(exp)} aria-label={`Delete ${exp.description}`}><Trash2 size={17}/></button></div></div>{!compact && exp.notes && <p className="transaction-notes">{exp.notes}</p>}</article>)}</div>
    </> : <div className="empty-state"><div className="empty-icon"><ReceiptText size={28}/></div><h3>{hasFilters ? 'No matching expenses' : 'No expenses yet'}</h3><p>{hasFilters ? 'Try another search or category to see more results.' : 'Your expense records will appear here once you add one.'}</p>{!hasFilters && onAdd && <button onClick={onAdd} className="secondary-action"><Plus size={17}/> Add your first expense</button>}</div>}
    {expenses.length > 0 && <div className="table-bottom">Showing <strong>{expenses.length}</strong> transaction{expenses.length === 1 ? '' : 's'} <span>{compact ? 'Most recent first' : 'Stored locally in your browser'}</span></div>}
  </div>
}
