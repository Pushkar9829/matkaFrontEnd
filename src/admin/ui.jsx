export function todayInput() {
  return new Date().toISOString().slice(0, 10)
}

export function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

export function betOutcome(item) {
  if (item.status === 'pending') return 'pending'
  return Number(item.earned) > 0 ? 'won' : 'lost'
}

export function statusClass(status) {
  const value = String(status || '').toLowerCase()
  if (['pending', 'open'].includes(value)) return 'bg-amber-100 text-amber-800'
  if (['won', 'approved', 'paid', 'success', 'closed'].includes(value)) return 'bg-emerald-100 text-emerald-800'
  if (['lost', 'rejected', 'blocked'].includes(value)) return 'bg-red-100 text-red-700'
  return 'bg-neutral-100 text-neutral-600'
}

export function Pill({ children, tone }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${tone || statusClass(children)}`}>
      {children}
    </span>
  )
}

export function Empty({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-500">
      {text}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
    />
  )
}

export function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-[#2b2110] text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50'}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-xl bg-white shadow-sm ring-1 ring-black/5 ${className}`}>{children}</div>
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-neutral-500">{label}</span>
      {children}
    </label>
  )
}

export const inputClass = 'w-full rounded-lg border border-neutral-200 px-3 py-2'
export const primaryBtn = 'rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-[#ad7d2c]'
export const greenBtn = 'rounded-lg bg-play px-4 py-2 font-medium text-white hover:bg-[#3d8b40]'
