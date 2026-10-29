import { BarChart3, LayoutDashboard, Leaf, Plus, ReceiptText, RotateCcw, X, CalendarDays, CalendarClock, PiggyBank, Settings2, ArrowLeftRight, ShoppingBag, Landmark } from 'lucide-react'
const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'spending', label: 'Spending calendar', icon: CalendarDays },
  { id: 'transfers', label: 'Smart transfers', icon: ArrowLeftRight },
  { id: 'expenses', label: 'Expenses', icon: ReceiptText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'bills', label: 'Monthly bills', icon: CalendarClock },
  { id: 'purchases', label: 'Purchases & refunds', icon: ShoppingBag },
  { id: 'wealth', label: 'Savings & investments', icon: PiggyBank },
  { id: 'maturity', label: 'Maturity calendar', icon: Landmark },
  { id: 'customize', label: 'Personalize', icon: Settings2, ArrowLeftRight, ShoppingBag, Landmark },
]
export default function Sidebar({ activeView, onNavigate, open, onClose, onAdd, onReset }) {
  return <>
    {open && <button aria-label="Close navigation" className="sidebar-overlay" onClick={onClose}/>}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><button type="button" className="brand" onClick={() => onNavigate('dashboard')} aria-label="Evergreen Expense dashboard"><span className="brand-symbol"><Leaf size={25} strokeWidth={2.2}/></span><span className="brand-type"><strong>Evergreen</strong><small>EXPENSE</small></span></button><button aria-label="Close menu" className="sidebar-close" onClick={onClose}><X size={20}/></button></div>
      <div className="sidebar-rule"/>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation" className="nav-links">{items.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${activeView === id ? 'active' : ''}`} onClick={() => onNavigate(id)} aria-current={activeView === id ? 'page' : undefined}><Icon size={20} strokeWidth={1.9}/><span>{label}</span>{activeView === id && <i/>}</button>)}</nav>
      <div className="sidebar-action"><button type="button" className="primary-action sidebar-add" onClick={() => { onAdd(); onClose() }}><Plus size={19}/> Add expense</button></div>
      <div className="sidebar-bottom"><span className="version-chip">EVERGREEN / V11</span><p>A little more clarity, every day.</p><button type="button" className="reset-button" onClick={onReset}><RotateCcw size={15}/> Reset everything to zero</button></div>
    </aside>
  </>
}
