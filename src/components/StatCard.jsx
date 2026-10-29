export default function StatCard({ icon: Icon, tone, label, value, note }) {
  return <article className={`stat-card stat-${tone}`}>
    <div className="stat-top"><span className="stat-label">{label}</span><div className="stat-icon"><Icon size={21}/></div></div>
    <div className={`stat-value ${String(value).length > 14 ? 'stat-value-long' : ''}`} title={value}>{value}</div><div className="stat-note">{note}</div>
  </article>
}
