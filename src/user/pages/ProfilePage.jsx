import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import { useAuth } from '../../api/AuthContext.jsx'
import { updateProfile, changeUserPin } from '../../api/api'

export default function ProfilePage() {
  const { profile, user } = useAuth()
  const [form, setForm] = useState({ name: '', dob: '', email: '' })
  const [pinForm, setPinForm] = useState({ currentMpin: '', newMpin: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    setForm({
      name: profile?.name || '',
      dob: profile?.dob || '',
      email: profile?.profileEmail || '',
    })
  }, [profile])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      await updateProfile(user.uid, form)
      setMessage('Profile saved.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="min-h-[70vh] bg-[#e4c25a]">
      <div className="relative pt-10">
        <img src={logo} alt="RPK 96" className="absolute top-4 left-1/2 z-10 h-20 w-20 -translate-x-1/2 object-contain drop-shadow-xl sm:h-24 sm:w-24" />
        <form onSubmit={handleSubmit} className="mt-12 rounded-t-2xl bg-white px-4 pt-16 pb-8 sm:px-6">
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-green-700 py-3 text-center text-sm font-semibold tracking-wide text-white">
              BALANCE : {profile?.balance || 0}
            </div>
            <div className="rounded-md bg-green-700 py-3 text-center text-sm font-semibold tracking-wide text-white">
              BONUS : {profile?.bonus || 0}
            </div>
          </div>
          <label className="mb-5 block max-w-xl">
            <span className="mb-1 block text-sm text-neutral-800">Name</span>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border-0 border-b border-neutral-300 bg-transparent py-1 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          <label className="mb-5 block max-w-xl">
            <span className="mb-1 block text-sm text-neutral-800">DOB</span>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border-0 border-b border-neutral-300 bg-transparent py-1 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          <label className="mb-6 block max-w-xl">
            <span className="mb-1 block text-sm text-neutral-800">Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border-0 border-b border-neutral-300 bg-transparent py-1 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          {message && <p className="mb-3 text-sm text-green-700">{message}</p>}
          <button type="submit" className="w-full rounded-md bg-[#e4c25a] py-3 text-white shadow-sm transition hover:brightness-105">
            Submit
          </button>
        </form>
        <div className="rounded-none bg-white px-4 pb-10 sm:px-6">
          <p className="mb-4 text-sm font-semibold text-neutral-800">Change MPIN</p>
          <label className="mb-5 block max-w-xl">
            <span className="mb-1 block text-sm text-neutral-800">Current MPIN</span>
            <input type="password" value={pinForm.currentMpin} onChange={(event) => setPinForm((current) => ({ ...current, currentMpin: event.target.value }))} className="w-full border-0 border-b border-neutral-300 bg-transparent py-1 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          <label className="mb-6 block max-w-xl">
            <span className="mb-1 block text-sm text-neutral-800">New MPIN</span>
            <input type="password" value={pinForm.newMpin} onChange={(event) => setPinForm((current) => ({ ...current, newMpin: event.target.value }))} className="w-full border-0 border-b border-neutral-300 bg-transparent py-1 text-neutral-800 outline-none focus:border-amber-600" />
          </label>
          <button
            type="button"
            className="w-full rounded-md bg-[#2b2110] py-3 text-white"
            onClick={() => changeUserPin(pinForm)
              .then(() => { setMessage('MPIN changed.'); setPinForm({ currentMpin: '', newMpin: '' }) })
              .catch((error) => setMessage(error.message))}
          >
            Change MPIN
          </button>
        </div>
      </div>
    </div>
  )
}
