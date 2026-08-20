import { useState } from 'react'
import { authErrorMessage, registerUser } from '../../api/auth'

export default function CreateMpinModal({ open, onClose, onError }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) return null

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.target)
    const mobile = String(form.get('mobile') || '')
    const mpin = String(form.get('mpin') || '')
    const confirmMpin = String(form.get('confirmMpin') || '')
    setError('')

    if (mpin !== confirmMpin) {
      setError('MPIN and Confirm MPIN do not match.')
      return
    }

    setBusy(true)
    try {
      await registerUser(mobile, mpin)
      onClose()
    } catch (err) {
      const message = authErrorMessage(err)
      setError(message)
      onError?.(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="mb-6 text-3xl font-semibold text-neutral-800">Create New MPIN</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-lg font-medium text-neutral-800">Mobile</span>
            <input
              type="tel"
              name="mobile"
              required
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-800 outline-none focus:border-amber-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-lg font-medium text-neutral-800">
              New MPIN <span className="text-sm text-red-500">(ex.A12345)</span>
            </span>
            <input
              type="password"
              name="mpin"
              required
              minLength={6}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-800 outline-none focus:border-amber-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-lg font-medium text-neutral-800">Confirm MPIN</span>
            <input
              type="password"
              name="confirmMpin"
              required
              minLength={6}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-800 outline-none focus:border-amber-600"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-neutral-300 py-3 text-lg font-medium text-neutral-800 transition hover:bg-neutral-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-gradient-to-b from-amber-500 to-amber-800 py-3 text-lg font-medium text-white shadow-sm transition hover:from-amber-400 hover:to-amber-700"
            >
              {busy ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
