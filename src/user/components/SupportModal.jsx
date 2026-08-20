import { useState } from 'react'
import { submitSupportTicket } from '../../api/api'

export default function SupportModal({ open, onClose }) {
  const [message, setMessage] = useState('')
  if (!open) return null

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.target)
    try {
      await submitSupportTicket({
        mobile: String(form.get('mobile') || ''),
        issue: String(form.get('issue') || ''),
      })
      setMessage('Ticket submitted.')
      setTimeout(onClose, 800)
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="mb-6 text-3xl font-semibold text-neutral-800">Support Form</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-lg font-medium text-neutral-800">Mobile</span>
            <input type="tel" name="mobile" required className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          <label className="block">
            <span className="mb-2 block text-lg font-medium text-neutral-800">Issue</span>
            <textarea name="issue" required rows={4} className="w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          {message && <p className="text-sm text-green-700">{message}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-neutral-300 py-3 text-lg font-medium text-neutral-800 transition hover:bg-neutral-400">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-b from-amber-500 to-amber-800 py-3 text-lg font-medium text-white shadow-sm">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}
