import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, ArrowDownRight, ArrowUpRight, CalendarDays, ClipboardList, Compass, CreditCard, Download, Minus, Plus, ShoppingBag, Wallet, Sparkles, TrendingUp, ArrowLeftRight, AlertTriangle, ShoppingBag as PurchaseIcon, Landmark, LogOut, User } from 'lucide-react'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatCard from './components/StatCard'
import ExpenseTable from './components/ExpenseTable'
import ExpenseModal from './components/ExpenseModal'
import ConfirmDialog from './components/ConfirmDialog'
import Toast from './components/Toast'
import LoadingSkeleton from './components/LoadingSkeleton'
import { CategoryChart, MonthlyChart } from './components/DashboardCharts'
import { useExpenses } from './hooks/useExpenses'
import { currency, getAnalytics } from './utils/analytics'
import BudgetCard from './components/BudgetCard'
import { useBudget } from './hooks/useBudget'
import { downloadExpensesCsv } from './utils/csv'
import SpendingExplorer from './components/SpendingExplorer'
import BillsPlanner from './components/BillsPlanner'
import WealthWorkspace from './components/WealthWorkspace'
import { useFinanceCollection } from './hooks/useFinanceCollections'
import { initialBills, initialAssets } from './data/finance'
import PersonalizeWorkspace from './components/PersonalizeWorkspace'
import SpendingSources from './components/SpendingSources'
import { usePreferences } from './hooks/usePreferences'
import { dateKey, monthKey } from './utils/periods'
import { getTransferCandidates, getBillChanges, purchaseDeadline, depositForecast } from './utils/financeIntelligence'
import TransferGuardian from './components/TransferGuardian'
import PurchaseTracker from './components/PurchaseTracker'
import MaturityCalendar from './components/MaturityCalendar'

const pages = {
  dashboard: { title: 'Overview', subtitle: 'A clearer way to stay close to your money.' },
  expenses: { title: 'Transactions', subtitle: 'Every expense, sorted and searchable.' },
  analytics: { title: 'Insights', subtitle: 'Thoughtful insights from your actual spending.' },
  spending: { title: 'Spending calendar', subtitle: 'Today, week, month, year — and every month in between.' },
  bills: { title: 'Monthly bills', subtitle: 'Plan recurring payments and check off what you have paid.' },
  wealth: { title: 'Savings & investments', subtitle: 'Build goals and track your financial reserves.' },
  customize: { title: 'Personalize', subtitle: 'Customize your banks, brands, categories and investments.' },
  transfers: { title: 'Smart Transfers', subtitle: 'Move money between your accounts without double counting.' },
  purchases: { title: 'Purchases & Refunds', subtitle: 'Watch return dates, warranty windows and refund progress.' },
  maturity: { title: 'Maturity Calendar', subtitle: 'Keep track of fixed deposits and renewal decisions.' },
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const { expenses, loading, add, update, remove, clear: clearExpenses } = useExpenses()
  const { budget, setBudget } = useBudget()
  const bills = useFinanceCollection('evergreen-bills-v1', initialBills)
  const assets = useFinanceCollection('evergreen-assets-v1', initialAssets)
  const transfers = useFinanceCollection('evergreen-transfers-v11', [])
  const purchases = useFinanceCollection('evergreen-purchases-v11', [])
  const profile = usePreferences()
  
  const [page, setPage] = useState('dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [modal, setModal] = useState({ open: false, expense: null })
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [bankFilter, setBankFilter] = useState('All')
  const [sort, setSort] = useState('date-desc')

  const analytics = useMemo(() => getAnalytics(expenses), [expenses])
  const today = dateKey(new Date())
  const thisMonth = monthKey(new Date())
  
  const guardianCounts = {
    transfers: getTransferCandidates(expenses, transfers.records).length,
    bills: getBillChanges(bills.records, thisMonth).filter(item => item.warning).length,
    purchases: purchases.records.filter(item => purchaseDeadline(item, today)?.urgent).length,
    maturity: assets.records.filter(item => depositForecast(item, today)?.soon).length,
  }
  
  const knownCategories = [...new Set([...profile.preferences.categories, ...expenses.map(e=>e.category), ...bills.records.map(b=>b.category)].filter(Boolean))]
  const knownBanks = [...new Set([...profile.preferences.banks, ...expenses.map(e=>e.bankName)].filter(Boolean))]
  
  const filtered = useMemo(() => expenses.filter(item => {
    const query = search.trim().toLowerCase()
    const searchable = `${item.description} ${item.notes || ''} ${item.merchant || ''} ${item.bankName || ''} ${Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || '')}`.toLowerCase()
    return (!query || searchable.includes(query)) && (category === 'All' || item.category === category) && (paymentFilter === 'All' || (item.paymentMethod || 'Others') === paymentFilter) && (bankFilter === 'All' || (item.bankName || '') === bankFilter)
  }).sort((a,b) => {
    if (sort === 'amount-desc') return b.amount - a.amount
    if (sort === 'amount-asc') return a.amount - b.amount
    if (sort === 'date-asc') return a.date.localeCompare(b.date)
    return b.date.localeCompare(a.date)
  }), [expenses, search, category, paymentFilter, bankFilter, sort])

  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3200); return () => clearTimeout(id) }, [toast])
  
  const closeModal = useCallback(() => setModal({ open: false, expense: null }), [])
  const cancelDelete = useCallback(() => setDeleting(null), [])
  const openAdd = () => setModal({ open: true, expense: null })
  const openEdit = expense => setModal({ open: true, expense })
  
  const save = values => {
    if (modal.expense) { update(modal.expense.id, values); setToast('Expense updated successfully') }
    else { add(values); setToast('Expense added successfully') }
    setModal({ open: false, expense: null })
  }
  
  const exportCsv = () => { downloadExpensesCsv(filtered); setToast(`Exported ${filtered.length} expense${filtered.length === 1 ? '' : 's'} as CSV`) }
  const saveBudget = value => { const ok = setBudget(value); if(ok) setToast('Monthly budget updated'); return ok }
  const deleteExpense = () => { if (!deleting) return; remove(deleting.id); setDeleting(null); setToast('Expense deleted') }
  const changePage = next => { setPage(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'auto' }) }
  
  const resetDemo = () => {
    if (!window.confirm('Reset everything to zero? This will permanently clear all expenses, monthly bills, savings and investment balances, transfers, purchases, your monthly budget, and custom names. This cannot be undone.')) return
    clearExpenses()
    bills.clear()
    assets.clear()
    transfers.clear()
    purchases.clear()
    setBudget(0)
    profile.reset()
    setSearch('')
    setCategory('All')
    setPaymentFilter('All')
    setBankFilter('All')
    setSort('date-desc')
    setDeleting(null)
    setModal({ open: false, expense: null })
    setToast('All financial data cleared. Starting from RM 0.00.')
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setToast('Signed out successfully')
    } catch (err) {
      setToast('Failed to sign out')
    }
  }

  // 1. Show loading screen while Firebase checks Auth status
  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#475569' }}>
      Loading EverGreen Expense...
    </div>
  }

  // 2. Show Auth screen if not logged in
  if (!currentUser) {
    return <Auth onAuthSuccess={(user) => setCurrentUser(user)} />
  }

  // 3. Render main application when authenticated
  return (
    <div className="app-shell">
      <Sidebar activeView={page} open={mobileNav} onNavigate={changePage} onClose={() => setMobileNav(false)} onAdd={openAdd} onReset={resetDemo} />
      <main className="app-main">
        <div className="page-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0 0' }}>
            <Header title={pages[page].title} subtitle={pages[page].subtitle} onMenu={() => setMobileNav(true)} onAdd={openAdd} showAdd={page === 'expenses' || page === 'spending'} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} /> {currentUser.email}
              </span>
              <button 
                onClick={handleSignOut}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>

          {loading ? <LoadingSkeleton /> : <>
            {page === 'dashboard' && <Dashboard data={analytics} budget={budget} guardianCounts={guardianCounts} onNavigate={changePage} onBudget={saveBudget} onEdit={openEdit} onDelete={setDeleting} onViewAll={() => changePage('expenses')} onAdd={openAdd} />}
            {page === 'expenses' && <ExpensesView expenses={filtered} totalCount={expenses.length} search={search} setSearch={setSearch} category={category} setCategory={setCategory} paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter} bankFilter={bankFilter} setBankFilter={setBankFilter} bankOptions={knownBanks} sort={sort} setSort={setSort} onEdit={openEdit} onDelete={setDeleting} onAdd={openAdd} onExport={exportCsv} categories={knownCategories} />}
            {page === 'analytics' && <AnalyticsView data={analytics} budget={budget} />}
            {page === 'spending' && <SpendingExplorer expenses={expenses} onAdd={openAdd} onEdit={openEdit} onNavigate={() => changePage('expenses')} />}
            {page === 'bills' && <BillsPlanner bills={bills.records} add={bills.add} update={bills.update} remove={bills.remove} notify={setToast} preferences={profile.preferences} />}
            {page === 'wealth' && <WealthWorkspace assets={assets.records} add={assets.add} update={assets.update} remove={assets.remove} notify={setToast} preferences={profile.preferences} />}
            {page === 'transfers' && <TransferGuardian expenses={expenses} transfers={transfers.records} add={transfers.add} remove={transfers.remove} expenseRemove={remove} banks={knownBanks} notify={setToast} />}
            {page === 'purchases' && <PurchaseTracker purchases={purchases.records} add={purchases.add} update={purchases.update} remove={purchases.remove} expenses={expenses} merchants={[...new Set([...profile.preferences.merchants,...expenses.map(e=>e.merchant)].filter(Boolean))]} notify={setToast} />}
            {page === 'maturity' && <MaturityCalendar assets={assets.records} add={assets.add} update={assets.update} banks={knownBanks} notify={setToast} />}
            {page === 'customize' && <PersonalizeWorkspace preferences={profile.preferences} add={profile.add} remove={profile.remove} reset={profile.reset} expenses={expenses} bills={bills.records} assets={assets.records} notify={setToast} />}
          </>}
        </div>
      </main>
      <ExpenseModal open={modal.open} expense={modal.expense} onClose={closeModal} onSave={save} preferences={profile.preferences} />
      <ConfirmDialog expense={deleting} onCancel={cancelDelete} onConfirm={deleteExpense} />
      <Toast message={toast} />
    </div>
  )
}

function Dashboard({ data, budget, guardianCounts, onNavigate, onBudget, onEdit, onDelete, onViewAll, onAdd }) {
  const averageExpense = data.transactionCount ? data.total / data.transactionCount : 0
  const categoryName = data.total ? data.highestCategory.name : 'No expenses yet'
  return <div className="page-sections">
    <section className="hero-grid" aria-label="Monthly financial overview">
      <article className="hero-main">
        <div className="hero-glow hero-glow-one"/><div className="hero-glow hero-glow-two"/>
        <div className="hero-main-content">
          <span className="hero-eyebrow"><Sparkles size={14}/> YOUR SPENDING, SIMPLIFIED</span>
          <h2>Good with money<br/><em>starts with clarity.</em></h2>
          <p>A beautiful place to track everyday spending, understand your habits, and plan ahead.</p>
          <div className="hero-lower"><div><span>SPENT THIS MONTH</span><strong title={currency.format(data.thisMonth)}>{currency.format(data.thisMonth)}</strong><small>{data.currentMonthCount} transactions this month</small></div><button onClick={onAdd} className="hero-quick-add"><Plus size={18}/> Add expense <ArrowRight size={17}/></button></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-outer"/><div className="orbit orbit-middle"/><div className="orbit orbit-inner"/><span className="orbit-stellar">✳</span><span className="orbit-glint">✦</span></div>
      </article>
      <BudgetCard budget={budget} spent={data.thisMonth} onSave={onBudget}/>
    </section>
    <section className="stats-grid" aria-label="Financial statistics">
      <StatCard icon={Wallet} tone="forest" label="All-time spending" value={currency.format(data.total)} note="All recorded transactions" />
      <StatCard icon={ClipboardList} tone="blue" label="Transactions" value={String(data.transactionCount)} note="Expenses recorded so far" />
      <StatCard icon={ShoppingBag} tone="purple" label="Top category" value={categoryName} note={data.total ? `${currency.format(data.highestCategory.value)} in total` : 'Add an expense to begin'} />
      <StatCard icon={CreditCard} tone="orange" label="Average expense" value={currency.format(averageExpense)} note="Per recorded transaction" />
    </section>
    <section className="v11-feature-strip" aria-label="Money Guardian tools">
      <div className="v11-feature-intro"><span className="eyebrow">EVERGREEN MONEY GUARDIAN</span><strong>Four smarter ways to stay ahead</strong><p>Transfers, rising bills, return deadlines and maturing deposits.</p></div>
      {[
        { id:'transfers', icon:ArrowLeftRight, label:'Smart transfers', count:guardianCounts.transfers, sub:'suggested reviews', hue:'mint' },
        { id:'bills', icon:AlertTriangle, label:'Bill alerts', count:guardianCounts.bills, sub:'price increases', hue:'amber' },
        { id:'purchases', icon:PurchaseIcon, label:'Return deadlines', count:guardianCounts.purchases, sub:'within 7 days', hue:'purple' },
        { id:'maturity', icon:Landmark, label:'Deposit maturity', count:guardianCounts.maturity, sub:'within 30 days', hue:'blue' },
      ].map(({id,icon:Icon,label,count,sub,hue}) => <button key={id} className={`v11-feature-link ${hue}`} onClick={()=>onNavigate(id)}><span className="v11-feature-icon"><Icon size={19}/></span><strong>{label}</strong><span><b>{count}</b> {sub}</span><ArrowRight size={16} className="v11-feature-arrow"/></button>)}
    </section>
    <section className="charts-grid"><MonthlyChart data={data.monthlyData}/><CategoryChart data={data.categoryData}/></section>
    <section className="panel recent-panel"><div className="panel-heading recent-heading"><div><div className="eyebrow">YOUR ACTIVITY</div><h2>Recent transactions</h2><p>Everything important, without the clutter.</p></div><button className="text-action" onClick={onViewAll}>See all transactions <ArrowRight size={17}/></button></div><ExpenseTable expenses={data.recent} onEdit={onEdit} onDelete={onDelete} compact onAdd={onAdd}/></section>
  </div>
}

function ExpensesView(props) {
  return <div className="page-sections">
    <section className="section-intro transactions-intro"><div><span className="eyebrow">THE DETAILS, BEAUTIFULLY ORGANISED</span><h2>Know where every ringgit went.</h2><p>Find, organise and update your transactions in seconds.</p></div><div className="transaction-intro-actions"><span className="count-pill">{props.totalCount} records</span><button className="export-action" onClick={props.onExport}><Download size={18}/> Export CSV</button></div></section>
    <section className="panel transactions-panel"><ExpenseTable {...props} /></section>
    <SpendingSources expenses={props.expenses} />
  </div>
}

function AnalyticsView({ data, budget }) {
  const share = data.total > 0 ? (data.highestCategory.value / data.total) * 100 : 0
  const { trendStatus, trendPercent, thisMonth, previousMonth } = data
  const trendText = trendStatus === 'up' ? 'Higher than last month' : trendStatus === 'down' ? 'Lower than last month' : trendStatus === 'flat' ? 'Unchanged from last month' : 'No percentage comparison available'
  const trendValue = trendStatus === 'no-baseline' ? 'New spending' : `${trendStatus === 'up' ? '+' : trendStatus === 'down' ? '−' : ''}${Math.abs(trendPercent || 0).toFixed(1)}%`
  const Icon = trendStatus === 'up' ? ArrowUpRight : trendStatus === 'down' ? ArrowDownRight : Minus

  return <div className="page-sections">
    <div className="section-intro"><div><span className="eyebrow">SPENDING INTELLIGENCE</span><h2>See the bigger picture.</h2><p>Simple insights grounded in the expenses you have actually recorded.</p></div></div>
    <section className="insight-grid" aria-label="Spending insights">
      <article className="insight-card insight-blue"><div className="insight-icon"><Icon size={23}/></div><span className="eyebrow">MONTHLY CHANGE</span><strong>{trendValue}</strong><p>{trendText}</p><span className="insight-foot">This month {currency.format(thisMonth)} · Previous {currency.format(previousMonth)}</span></article>
      <article className="insight-card insight-purple"><div className="insight-icon"><Compass size={23}/></div><span className="eyebrow">TOP CATEGORY</span><strong className="category-strong">{data.highestCategory.name}</strong><p>{data.total ? `${share.toFixed(1)}% of recorded spending` : 'Add expenses to see your top category'}</p><span className="insight-foot">{currency.format(data.highestCategory.value)} spent overall</span></article>
      <article className="insight-card insight-orange"><div className="insight-icon"><CalendarDays size={23}/></div><span className="eyebrow">THIS MONTH</span><strong>{data.currentMonthCount} <span className="insight-unit">transactions</span></strong><p>Average of {currency.format(data.averageDaily)} per calendar day so far.</p><span className="insight-foot">Current month spending: {currency.format(thisMonth)}</span></article>
    </section>
    {budget > 0 && <section className="analytics-budget panel"><div><span className="eyebrow">MONTHLY BUDGET</span><h3>{data.thisMonth > budget ? `${currency.format(data.thisMonth - budget)} over your budget` : `${currency.format(budget - data.thisMonth)} remaining this month`}</h3><p>{Math.round(data.thisMonth/budget*100)}% of your {currency.format(budget)} monthly budget used</p></div><div className="analytics-budget-bar"><span style={{width:`${Math.min(100,data.thisMonth/budget*100)}%`}}/></div></section>}
    <section className="charts-grid"><MonthlyChart data={data.monthlyData} title="Six-month trend" subtitle="Compare spending month by month"/><CategoryChart data={data.categoryData} title="Category allocation" subtitle="Your spending, by type" /></section>
  </div>
}