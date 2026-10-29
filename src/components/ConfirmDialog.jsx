import { useEffect, useRef } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'

export default function ConfirmDialog({ expense, onCancel, onConfirm }) {
  const cancelRef = useRef(null)
  const prevFocus = useRef(null)
  useEffect(() => {
    if (!expense) return
    prevFocus.current = document.activeElement
    cancelRef.current?.focus()
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); onCancel() }
      if (e.key === 'Tab') { // two action buttons: cycle focus within the dialog
        const buttons = [cancelRef.current, cancelRef.current?.nextElementSibling].filter(Boolean)
        if (!buttons.length) return
        const current = buttons.indexOf(document.activeElement)
        e.preventDefault()
        buttons[(current + (e.shiftKey ? buttons.length-1 : 1)) % buttons.length].focus()
      }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); prevFocus.current?.focus?.() }
  }, [expense, onCancel])
  if (!expense) return null
  return <div className="modal-backdrop"><div className="confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
    <div className="warning-symbol"><AlertTriangle size={25}/></div><h2 id="confirm-title">Delete this expense?</h2><p id="confirm-description">“{expense.description}” will be removed from your expense history. This cannot be undone.</p>
    <div className="confirm-actions"><button ref={cancelRef} className="secondary-action" onClick={onCancel}>Keep expense</button><button className="danger-action" onClick={onConfirm}><Trash2 size={17}/> Delete expense</button></div>
  </div></div>
}
