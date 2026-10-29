import { CheckCircle2, X } from 'lucide-react'
export default function Toast({ message }) {
  return <div className={`toast ${message ? 'toast-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{message && <><CheckCircle2 size={20}/><span>{message}</span></>}</div>
}
