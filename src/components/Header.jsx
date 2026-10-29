import { CalendarDays, Menu, Plus } from 'lucide-react'
export default function Header({ title, subtitle, onMenu, onAdd, showAdd = true }) {
  const date = new Intl.DateTimeFormat('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
  return <header className="app-header">
    <div className="header-copy"><div className="header-title-row"><button className="menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={23}/></button><div><span className="eyebrow">EVERGREEN EXPENSE</span><h1>{title}</h1></div></div><p>{subtitle}</p></div>
    <div className="header-actions"><div className="date-chip"><CalendarDays size={17}/><span>{date}</span></div>{showAdd && <button className="primary-action header-add" onClick={onAdd}><Plus size={19}/> Add expense</button>}</div>
  </header>
}
