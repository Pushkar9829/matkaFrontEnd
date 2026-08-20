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
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 p-3 sm:items-center sm:p-4">
      <div className="my-auto w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-8">
        <h2 className="mb-4 text-2xl font-semibold text-neutral-800 sm:mb-6 sm:text-3xl">Support Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <label className="block">
            <span className="mb-2 block text-base font-medium text-neutral-800 sm:text-lg">Mobile</span>
            <input type="tel" name="mobile" required className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          <label className="block">
            <span className="mb-2 block text-base font-medium text-neutral-800 sm:text-lg">Issue</span>
            <textarea name="issue" required rows={4} className="w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          {message && <p className="text-sm text-green-700">{message}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-neutral-300 py-3 text-base font-medium text-neutral-800 transition hover:bg-neutral-400 sm:text-lg">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-b from-amber-500 to-amber-800 py-3 text-base font-medium text-white shadow-sm sm:text-lg">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}
