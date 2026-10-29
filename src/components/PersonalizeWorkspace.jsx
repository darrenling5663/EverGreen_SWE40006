import { useState } from 'react'
import { Building2, Store, Tags, ChartNoAxesCombined, Plus, X, ShieldCheck, Lightbulb } from 'lucide-react'
import { preferenceGroups, preferenceKeys } from '../data/preferences.js'

const icons = { banks: Building2, merchants: Store, categories: Tags, investmentTypes: ChartNoAxesCombined }
const tones = { banks: 'blue', merchants: 'coral', categories: 'mint', investmentTypes: 'violet' }

function SettingCollection({ id, items, add, remove, inUse, notify }) {
  const group = preferenceGroups[id]
  const Icon = icons[id]
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const submit = e => {
    e.preventDefault()
    const response = add(id, draft)
    if (!response.ok) { setError(response.message); return }
    setError(''); setDraft(''); notify(`${response.value} added to ${group.title.toLowerCase()}`)
  }
  return <section className={`panel personalization-panel personalization-${tones[id]}`}>
    <div className="personalization-heading"><div className="personalization-symbol"><Icon size={22}/></div><div><span className="eyebrow">YOUR PREFERENCES</span><h3>{group.title}</h3><p>{group.description}</p></div><span className="personalization-count">{items.length} saved</span></div>
    <div className="personalization-items">{items.length ? items.map(item => {
      const linked = inUse(id, item)
      return <div className="personalization-chip" key={item}><span>{item}</span><button type="button" onClick={() => { if(linked){setError(`“${item}” is used in saved records. Update those records first.`);return} if(id==='categories' && items.length===1){setError('Keep at least one expense category.');return} remove(id,item);setError('');notify(`${item} removed`) }} title={linked ? `In use in ${linked} saved records` : `Remove ${item}`} aria-label={`Remove ${item}`} className={linked?'in-use':''}><X size={14}/></button></div>
    }) : <p className="personalization-empty">No entries yet. Add your first custom name below.</p>}</div>
    <form className="personalization-add" onSubmit={submit}><label><span className="sr-only">New {group.title.toLowerCase()} name</span><input maxLength={60} value={draft} onChange={e=>{setDraft(e.target.value);setError('')}} placeholder={`Add custom ${id === 'banks' ? 'bank or wallet' : id === 'merchants' ? 'merchant or brand' : id === 'categories' ? 'category' : 'investment type'}...`}/></label><button type="submit"><Plus size={17}/> Add</button></form>
    {error && <p className="personalization-error" role="alert">{error}</p>}
    <p className="personalization-tip">For example: {group.examples}</p>
  </section>
}

export default function PersonalizeWorkspace({ preferences, add, remove, reset, expenses, bills, assets, notify }) {
  const inUse = (group, name) => {
    if (group === 'banks') return expenses.filter(e=>e.bankName===name).length + bills.filter(b=>b.bankName===name).length + assets.filter(a=>a.institution===name).length
    if (group === 'merchants') return expenses.filter(e=>e.merchant===name).length + bills.filter(b=>b.merchant===name).length
    if (group === 'categories') return expenses.filter(e=>e.category===name).length + bills.filter(b=>b.category===name).length
    return assets.filter(a=>a.investmentType===name).length
  }
  return <div className="page-sections personalize-page">
    <section className="personalization-hero"><div><span className="eyebrow">MAKE IT YOURS</span><h2>Money looks different for everyone.</h2><p>Save your own banks, wallet providers, brands, spending categories and investment types. Your lists appear automatically in the relevant forms.</p></div><span className="personalize-emblem"><Tags size={38}/></span></section>
    <div className="personalization-tip-banner"><Lightbulb size={20}/><span><strong>Keep things simple:</strong> all these fields are optional. You can track an ordinary cash expense without choosing a bank or merchant.</span></div>
    <div className="personalization-grid">{preferenceKeys.map(key=><SettingCollection key={key} id={key} items={preferences[key]} add={add} remove={remove} inUse={inUse} notify={notify}/>)}</div>
    <div className="personalization-footer"><ShieldCheck size={20}/><div><strong>Private, manual organization.</strong><p>Only names and labels are stored in this browser. This app does not request passwords, bank account numbers or live brokerage access.</p></div><button onClick={() => { if(window.confirm('Restore the default suggested lists? Custom names will be removed. Existing transactions and savings records will stay unchanged.')) { reset(); notify('Suggested lists restored') } }}>Restore suggested lists</button></div>
  </div>
}
