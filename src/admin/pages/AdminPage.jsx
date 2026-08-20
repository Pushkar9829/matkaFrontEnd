import { useEffect, useMemo, useRef, useState } from 'react'
import {
  adjustBalance,
  approveDeposit,
  approveWithdraw,
  broadcastNotification,
  declareResult,
  deleteMarket,
  listenAllBets,
  listenAllPostings,
  listenAllWithdrawals,
  listenChatMessages,
  listenChatThreads,
  listenDayResults,
  listenDeposits,
  listenMarkets,
  listenTickets,
  listenTransfers,
  listenUsers,
  rejectDeposit,
  rejectWithdraw,
  rewindResult,
  sendChatMessage,
  sendGamePosting,
  setUserBlocked,
  updateTicket,
  upsertMarket,
} from '../../api/api'
import DashboardPanel from '../panels/DashboardPanel'
import SettingsPanel from '../panels/SettingsPanel'
import UserDetail from '../panels/UserDetail'

const tabs = [
  { id: 'Dashboard', label: 'Dashboard', hint: 'Counts and latest activity' },
  { id: 'Users', label: 'Users', hint: 'All players — open View detail for bets, wallet and chat' },
  { id: 'Markets', label: 'Markets', hint: 'Create, edit, open or close games' },
  { id: 'Results', label: 'Results', hint: 'Publish a result, or rewind a wrong one' },
  { id: 'Bets', label: 'Bets', hint: 'Review plays across all markets' },
  { id: 'Wallet', label: 'Wallet', hint: 'Approve deposits, payouts and transfers' },
  { id: 'Chat', label: 'Chat', hint: 'One chat per user for deposit and withdraw' },
  { id: 'Alerts', label: 'Alerts', hint: 'Broadcast a notice to every user' },
  { id: 'Postings', label: 'Postings', hint: 'Game notes from players' },
  { id: 'Support', label: 'Support', hint: 'Open tickets and close them when done' },
  { id: 'Settings', label: 'Settings', hint: 'Password, QR, UPI, banner and flash message' },
]

const emptyMarket = {
  id: '',
  name: '',
  shortName: '',
  open: '',
  close: '',
  resultAt: '',
  lastTime: '',
  playOpen: true,
  order: 0,
}

const marketFields = [
  { key: 'name', label: 'Market name', placeholder: 'Gali' },
  { key: 'shortName', label: 'Short name', placeholder: 'GL' },
  { key: 'open', label: 'Open time', placeholder: '09:30 AM' },
  { key: 'close', label: 'Close time', placeholder: '10:30 AM' },
  { key: 'resultAt', label: 'Result time', placeholder: '11:00 AM' },
  { key: 'lastTime', label: 'Last play time', placeholder: '11:20:00 PM' },
]

function slug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function todayInput() {
  return new Date().toISOString().slice(0, 10)
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function betOutcome(item) {
  if (item.status === 'pending') return 'pending'
  return Number(item.earned) > 0 ? 'won' : 'lost'
}

function statusClass(status) {
  const value = String(status || '').toLowerCase()
  if (['pending', 'open'].includes(value)) return 'bg-amber-100 text-amber-800'
  if (['won', 'approved', 'paid', 'closed'].includes(value)) return 'bg-emerald-100 text-emerald-800'
  if (['lost', 'rejected'].includes(value)) return 'bg-red-100 text-red-700'
  return 'bg-neutral-100 text-neutral-600'
}

function Pill({ children, tone }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${tone || statusClass(children)}`}>
      {children}
    </span>
  )
}

function Empty({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-500">
      {text}
    </div>
  )
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-[#d7b54a] focus:ring-2"
    />
  )
}

function FilterChip({ active, onClick, children }) {
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

function Card({ children, className = '' }) {
  return <div className={`rounded-xl bg-white shadow-sm ring-1 ring-black/5 ${className}`}>{children}</div>
}

function NavIcon({ id }) {
  const common = 'h-4 w-4 shrink-0 opacity-90'
  if (id === 'Dashboard') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    )
  }
  if (id === 'Users') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (id === 'Markets') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4v16M16 4v16" />
      </svg>
    )
  }
  if (id === 'Results') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    )
  }
  if (id === 'Bets') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19h16M7 16V8m5 8V5m5 11v-6" />
      </svg>
    )
  }
  if (id === 'Wallet') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20M16 14h2" />
      </svg>
    )
  }
  if (id === 'Chat') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    )
  }
  if (id === 'Alerts') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    )
  }
  if (id === 'Postings') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </svg>
    )
  }
  if (id === 'Support') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4M12 17h.01" />
      </svg>
    )
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

export default function AdminPage({ mobile, onLogout }) {
  const [tab, setTab] = useState('Dashboard')
  const [users, setUsers] = useState([])
  const [markets, setMarkets] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [bets, setBets] = useState([])
  const [transfers, setTransfers] = useState([])
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [reply, setReply] = useState('')
  const [postings, setPostings] = useState([])
  const [tickets, setTickets] = useState([])
  const [notice, setNotice] = useState(null)
  const [resultForm, setResultForm] = useState({ marketId: '', value: '', date: todayInput() })
  const [dayResults, setDayResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [alertText, setAlertText] = useState('')
  const [adjust, setAdjust] = useState({ userId: '', amount: '', reason: '' })
  const [marketForm, setMarketForm] = useState(emptyMarket)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [betQuery, setBetQuery] = useState('')
  const [betFilter, setBetFilter] = useState('pending')
  const [walletFilter, setWalletFilter] = useState('pending')
  const [supportFilter, setSupportFilter] = useState('open')
  const mainRef = useRef(null)

  useEffect(() => listenUsers(setUsers), [])
  useEffect(() => listenMarkets(setMarkets), [])
  useEffect(() => listenDeposits(setDeposits), [])
  useEffect(() => listenAllWithdrawals(setWithdrawals), [])
  useEffect(() => listenAllBets(setBets), [])
  useEffect(() => listenTransfers(setTransfers), [])
  useEffect(() => listenChatThreads(setThreads), [])
  useEffect(() => listenAllPostings(setPostings), [])
  useEffect(() => listenTickets(setTickets), [])
  useEffect(() => listenDayResults(resultForm.date, setDayResults), [resultForm.date])
  useEffect(() => {
    if (!activeThread) return undefined
    return listenChatMessages(activeThread.id, setChatMessages)
  }, [activeThread])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [tab])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  function flash(error) {
    setNotice({ type: 'err', text: error?.message || String(error) })
  }

  function ok(text) {
    setNotice({ type: 'ok', text })
  }

  function saveMarket() {
    const id = marketForm.id || slug(marketForm.name)
    if (!id || !marketForm.name) return flash(new Error('Market name is required.'))
    upsertMarket({
      market: {
        ...marketForm,
        id,
        playOpen: marketForm.playOpen !== false,
        order: Number(marketForm.order) || 0,
      },
    })
      .then(() => {
        ok('Market saved')
        setMarketForm(emptyMarket)
      })
      .catch(flash)
  }

  const players = useMemo(() => users.filter((item) => item.role !== 'admin'), [users])
  const userById = useMemo(() => Object.fromEntries(users.map((item) => [item.id, item])), [users])
  const currentTab = tabs.find((item) => item.id === tab)

  const shownUsers = players.filter((item) => {
    const matches = !userQuery || `${item.mobile} ${item.id} ${item.mpin || ''}`.toLowerCase().includes(userQuery.toLowerCase())
    if (userFilter === 'blocked') return matches && item.blocked
    return matches
  })

  const shownBets = bets.filter((item) => {
    const matches = !betQuery || `${item.mobile} ${item.marketName} ${item.number} ${item.type}`.toLowerCase().includes(betQuery.toLowerCase())
    if (betFilter === 'all') return matches
    return matches && betOutcome(item) === betFilter
  })

  const pendingDeposits = deposits.filter((item) => item.status === 'pending')
  const pendingWithdrawals = withdrawals.filter((item) => item.status === 'pending')
  const shownDeposits = walletFilter === 'pending' ? pendingDeposits : deposits
  const shownWithdrawals = walletFilter === 'pending' ? pendingWithdrawals : withdrawals
  const shownTickets = supportFilter === 'open' ? tickets.filter((item) => item.status === 'open') : tickets

  const badges = {
    Wallet: pendingDeposits.length + pendingWithdrawals.length,
    Chat: threads.length,
    Support: tickets.filter((item) => item.status === 'open').length,
    Bets: bets.filter((item) => item.status === 'pending').length,
  }

  function openTab(id) {
    setTab(id)
    setSidebarOpen(false)
  }

  return (
    <div className="h-dvh overflow-hidden bg-[#eef3f8]">
      {sidebarOpen && (
        <button type="button" className="fixed inset-0 z-30 bg-black/40 md:hidden" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#2b2110] text-white transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <p className="text-lg font-semibold tracking-wide">RPK 90</p>
          <p className="text-xs text-[#e4c25a]">Admin panel</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto py-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openTab(item.id)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${tab === item.id ? 'bg-[#d7b54a] font-medium text-white' : 'text-white/80 hover:bg-white/10'}`}
            >
              <NavIcon id={item.id} />
              <span className="flex-1">{item.label}</span>
              {badges[item.id] > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${tab === item.id ? 'bg-white text-[#8a6b12]' : 'bg-[#d7b54a] text-white'}`}>
                  {badges[item.id]}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 px-5 py-4 text-sm">
          <p className="truncate text-white/70">{mobile}</p>
          <button type="button" onClick={onLogout} className="mt-3 w-full rounded-md bg-[#d7b54a] py-2 font-medium text-white hover:bg-[#c9a63d]">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex h-full flex-col md:pl-60">
        <header className="flex shrink-0 items-center justify-between bg-[#d7b54a] px-4 py-3 text-white shadow-sm md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="rounded-md bg-black/20 px-3 py-1.5 text-sm md:hidden" onClick={() => setSidebarOpen(true)}>
              Menu
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-medium leading-tight">{currentTab?.label}</h1>
              <p className="hidden truncate text-xs text-white/80 sm:block">{currentTab?.hint}</p>
            </div>
          </div>
          <span className="hidden text-sm md:inline">{mobile}</span>
        </header>

        {notice && (
          <div className={`shrink-0 px-4 py-2 text-sm md:px-6 ${notice.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
            {notice.text}
          </div>
        )}

        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto p-4 text-sm md:p-6">
          {tab === 'Dashboard' && (
            <DashboardPanel
              userById={userById}
              onOpenTab={(next) => {
                if (next === 'Users') setSelectedUser(null)
                openTab(next)
              }}
            />
          )}

          {tab === 'Users' && selectedUser && (
            <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} onError={flash} onOk={ok} />
          )}

          {tab === 'Users' && !selectedUser && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <SearchBox value={userQuery} onChange={setUserQuery} placeholder="Search number or PIN" />
                <FilterChip active={userFilter === 'all'} onClick={() => setUserFilter('all')}>All ({players.length})</FilterChip>
                <FilterChip active={userFilter === 'blocked'} onClick={() => setUserFilter('blocked')}>
                  Blocked ({players.filter((item) => item.blocked).length})
                </FilterChip>
              </div>
              <Card className="p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Adjust points</p>
                <div className="flex flex-wrap gap-2">
                  <input value={adjust.userId} onChange={(event) => setAdjust((current) => ({ ...current, userId: event.target.value }))} placeholder="Click a user, or paste id" className="min-w-[180px] flex-1 rounded-lg border border-neutral-200 px-3 py-2" />
                  <input value={adjust.amount} onChange={(event) => setAdjust((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount (+ / −)" className="w-32 rounded-lg border border-neutral-200 px-3 py-2" />
                  <input value={adjust.reason} onChange={(event) => setAdjust((current) => ({ ...current, reason: event.target.value }))} placeholder="Reason" className="min-w-[140px] flex-1 rounded-lg border border-neutral-200 px-3 py-2" />
                  <button
                    type="button"
                    className="rounded-lg bg-[#d7b54a] px-4 py-2 font-medium text-white hover:bg-[#c9a63d]"
                    onClick={() => adjustBalance({ userId: adjust.userId, amount: Number(adjust.amount), reason: adjust.reason }).then(() => { ok('Balance updated'); setAdjust({ userId: '', amount: '', reason: '' }) }).catch(flash)}
                  >
                    Adjust
                  </button>
                </div>
              </Card>
              <Card className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="sticky top-0 bg-[#e4c25a] text-white">
                      <th className="p-3 font-medium">Number</th>
                      <th className="font-medium">PIN</th>
                      <th className="font-medium">Balance</th>
                      <th className="font-medium">Win</th>
                      <th className="font-medium">Status</th>
                      <th className="font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownUsers.map((item) => (
                      <tr
                        key={item.id}
                        className={`cursor-pointer border-b border-neutral-100 hover:bg-amber-50 ${adjust.userId === item.id ? 'bg-amber-50' : ''}`}
                        onClick={() => setAdjust((current) => ({ ...current, userId: item.id }))}
                      >
                        <td className="p-3">
                          <span className="font-semibold tracking-wide">{item.mobile || '—'}</span>
                          <div className="text-[11px] text-neutral-400">{item.id}</div>
                        </td>
                        <td className="font-mono">{item.mpin || '—'}</td>
                        <td className="font-medium">{money(item.balance)}</td>
                        <td>{money(item.winAmount)}</td>
                        <td>{item.blocked ? <Pill tone="bg-red-100 text-red-700">Blocked</Pill> : <Pill tone="bg-emerald-100 text-emerald-800">Active</Pill>}</td>
                        <td className="flex flex-wrap gap-3 p-3">
                          <button
                            type="button"
                            className="text-blue-700 hover:underline"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedUser(item)
                            }}
                          >
                            View detail
                          </button>
                          <button
                            type="button"
                            className="text-blue-700 hover:underline"
                            onClick={(event) => {
                              event.stopPropagation()
                              setUserBlocked({ userId: item.id, blocked: !item.blocked }).catch(flash)
                            }}
                          >
                            {item.blocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {shownUsers.length === 0 && (
                      <tr><td className="p-6 text-neutral-500" colSpan={6}>No users match this search.</td></tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {tab === 'Markets' && (
            <div className="space-y-4">
              <Card className="p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {marketForm.id ? `Editing ${marketForm.name || marketForm.id}` : 'New market'}
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {marketFields.map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-1 block text-xs text-neutral-500">{field.label}</span>
                      <input
                        value={marketForm[field.key] || ''}
                        onChange={(event) => setMarketForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2"
                        placeholder={field.placeholder}
                      />
                    </label>
                  ))}
                  <label className="block">
                    <span className="mb-1 block text-xs text-neutral-500">Display order</span>
                    <input type="number" value={marketForm.order} onChange={(event) => setMarketForm((current) => ({ ...current, order: event.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2" />
                  </label>
                  <div className="flex items-end gap-2">
                    <button type="button" className="rounded-lg bg-[#2ea44f] px-4 py-2 font-medium text-white hover:bg-[#279346]" onClick={saveMarket}>
                      Save market
                    </button>
                    <button type="button" className="rounded-lg bg-neutral-200 px-4 py-2 hover:bg-neutral-300" onClick={() => setMarketForm(emptyMarket)}>
                      New
                    </button>
                  </div>
                </div>
              </Card>
              {markets.length === 0 && <Empty text="No markets yet. Add one above." />}
              {markets.map((market) => (
                <Card key={market.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{market.name}</p>
                    <p className="text-xs text-neutral-500">
                      {market.shortName} · Open {market.open} · Close {market.close} · Last {market.lastTime}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>{market.playOpen === false ? 'Closed' : 'Open'}</Pill>
                    <button type="button" className="text-blue-700 hover:underline" onClick={() => setMarketForm({ ...emptyMarket, ...market })}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-[#2b2110] px-3 py-1.5 text-white"
                      onClick={() => upsertMarket({ market: { ...market, playOpen: market.playOpen === false } }).then(() => ok('Market updated')).catch(flash)}
                    >
                      {market.playOpen === false ? 'Open play' : 'Force close'}
                    </button>
                    <button
                      type="button"
                      className="text-red-700 hover:underline"
                      onClick={() => {
                        if (!window.confirm(`Delete ${market.name}?`)) return
                        deleteMarket({ id: market.id }).then(() => ok('Market deleted')).catch(flash)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === 'Results' && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="space-y-3 p-5">
                <p className="text-neutral-500">Publish a 2-digit result for one market. Matching pending bets settle. If the result is wrong, rewind first — all those bets stay pending until you publish again.</p>
                <label className="block">
                  <span className="mb-1 block text-xs text-neutral-500">Market</span>
                  <select value={resultForm.marketId} onChange={(event) => setResultForm((current) => ({ ...current, marketId: event.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2">
                    <option value="">Select market</option>
                    {markets.map((market) => <option key={market.id} value={market.id}>{market.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-neutral-500">Result</span>
                  <input value={resultForm.value} onChange={(event) => setResultForm((current) => ({ ...current, value: event.target.value }))} placeholder="e.g. 61" className="w-full rounded-lg border border-neutral-200 px-3 py-2" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-neutral-500">Date</span>
                  <input type="date" value={resultForm.date} onChange={(event) => setResultForm((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-[#2ea44f] px-4 py-2 font-medium text-white hover:bg-[#279346]"
                    onClick={() => {
                      if (!resultForm.marketId || !resultForm.value) return flash(new Error('Choose a market and enter a result.'))
                      if (!window.confirm('Publish this result and settle pending bets?')) return
                      declareResult({ ...resultForm, date: resultForm.date || undefined })
                        .then((data) => ok(`Result published. ${data.settled || 0} bets settled.`))
                        .catch(flash)
                    }}
                  >
                    Publish result
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                    onClick={() => {
                      if (!resultForm.marketId) return flash(new Error('Select the market to rewind.'))
                      if (!window.confirm('Rewind this result? Wins will be reversed and bets go back to pending.')) return
                      rewindResult({ marketId: resultForm.marketId, date: resultForm.date })
                        .then((data) => ok(`Rewound. ${data.reversed || 0} bets are pending again.`))
                        .catch(flash)
                    }}
                  >
                    Rewind result
                  </button>
                </div>
              </Card>
              <Card className="p-5">
                <h3 className="mb-3 font-semibold">Published on {resultForm.date || 'today'}</h3>
                {dayResults.map((item) => (
                  <div key={item.id} className="mb-2 flex items-center justify-between border-b border-neutral-100 py-2 last:mb-0 last:border-0">
                    <span>{item.marketName}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
                {dayResults.length === 0 && <p className="text-neutral-500">No results published for this date.</p>}
              </Card>
            </div>
          )}

          {tab === 'Bets' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <SearchBox value={betQuery} onChange={setBetQuery} placeholder="Search mobile, market, number" />
                {['pending', 'won', 'lost', 'all'].map((value) => (
                  <FilterChip key={value} active={betFilter === value} onClick={() => setBetFilter(value)}>
                    {value === 'all' ? `All (${bets.length})` : `${value} (${bets.filter((item) => betOutcome(item) === value).length})`}
                  </FilterChip>
                ))}
              </div>
              <Card className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="sticky top-0 bg-[#e4c25a] text-white">
                      <th className="p-3 font-medium">User</th>
                      <th className="font-medium">Market</th>
                      <th className="font-medium">Type</th>
                      <th className="font-medium">Number</th>
                      <th className="font-medium">Points</th>
                      <th className="font-medium">Status</th>
                      <th className="font-medium">Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownBets.map((item) => (
                      <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="p-3">{item.mobile || item.userId}</td>
                        <td>{item.marketName}</td>
                        <td>{item.type}{item.extra ? ` ${item.extra}` : ''}</td>
                        <td className="font-medium">{item.number}</td>
                        <td>{item.points}</td>
                        <td><Pill>{betOutcome(item)}</Pill></td>
                        <td>{money(item.earned)}</td>
                      </tr>
                    ))}
                    {shownBets.length === 0 && (
                      <tr><td className="p-6 text-neutral-500" colSpan={7}>No bets in this view.</td></tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {tab === 'Wallet' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <FilterChip active={walletFilter === 'pending'} onClick={() => setWalletFilter('pending')}>
                  Needs action ({pendingDeposits.length + pendingWithdrawals.length})
                </FilterChip>
                <FilterChip active={walletFilter === 'all'} onClick={() => setWalletFilter('all')}>Show all</FilterChip>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-4">
                  <h3 className="mb-3 font-semibold">Deposits</h3>
                  {shownDeposits.map((item) => (
                    <div key={item.id} className="mb-2 flex items-center justify-between gap-3 border-b border-neutral-100 py-2 last:mb-0 last:border-0">
                      <div>
                        <p className="font-medium">{item.mobile} · {money(item.amount)}</p>
                        <Pill>{item.status}</Pill>
                      </div>
                      {item.status === 'pending' && (
                        <span className="flex gap-2">
                          <button type="button" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700" onClick={() => approveDeposit({ id: item.id }).then(() => ok('Deposit approved')).catch(flash)}>Approve</button>
                          <button type="button" className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700" onClick={() => rejectDeposit({ id: item.id }).then(() => ok('Deposit rejected')).catch(flash)}>Reject</button>
                        </span>
                      )}
                    </div>
                  ))}
                  {shownDeposits.length === 0 && <p className="text-neutral-500">No deposit requests here.</p>}
                </Card>
                <Card className="p-4">
                  <h3 className="mb-3 font-semibold">Withdrawals</h3>
                  {shownWithdrawals.map((item) => (
                    <div key={item.id} className="mb-2 flex items-center justify-between gap-3 border-b border-neutral-100 py-2 last:mb-0 last:border-0">
                      <div>
                        <p className="font-medium">{item.mobile} · {money(item.amount)}</p>
                        <Pill>{item.status}</Pill>
                      </div>
                      {item.status === 'pending' && (
                        <span className="flex gap-2">
                          <button type="button" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700" onClick={() => approveWithdraw({ id: item.id }).then(() => ok('Withdrawal marked paid')).catch(flash)}>Paid</button>
                          <button type="button" className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700" onClick={() => rejectWithdraw({ id: item.id }).then(() => ok('Withdrawal rejected')).catch(flash)}>Reject</button>
                        </span>
                      )}
                    </div>
                  ))}
                  {shownWithdrawals.length === 0 && <p className="text-neutral-500">No withdrawal requests here.</p>}
                </Card>
                <Card className="p-4 lg:col-span-2">
                  <h3 className="mb-3 font-semibold">Transfers</h3>
                  {transfers.map((item) => (
                    <div key={item.id} className="mb-2 border-b border-neutral-100 py-2 last:mb-0 last:border-0">
                      {userById[item.fromUserId]?.mobile || item.fromUserId} → {item.toMobile || item.toUserId}
                      <span className="ml-2 font-medium">{item.points} pts</span>
                    </div>
                  ))}
                  {transfers.length === 0 && <p className="text-neutral-500">No transfers.</p>}
                </Card>
              </div>
            </div>
          )}

          {tab === 'Chat' && (
            <div className="grid min-h-[calc(100dvh-9rem)] gap-4 md:grid-cols-3">
              <Card className="overflow-y-auto p-2">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThread(thread)}
                    className={`mb-1 block w-full rounded-lg px-3 py-2 text-left ${activeThread?.id === thread.id ? 'bg-amber-50 ring-1 ring-[#d7b54a]' : 'hover:bg-neutral-50'}`}
                  >
                    <span className="font-medium">{userById[thread.userId]?.mobile || thread.userId.slice(0, 8)}</span>
                    <span className="ml-2 text-xs text-neutral-400">chat</span>
                    <div className="truncate text-[11px] text-neutral-500">{thread.lastText}</div>
                  </button>
                ))}
                {threads.length === 0 && <p className="p-3 text-neutral-500">No chat threads yet.</p>}
              </Card>
              <Card className="flex min-h-[320px] flex-col p-3 md:col-span-2">
                {activeThread ? (
                  <>
                    <p className="mb-2 shrink-0 text-xs text-neutral-500">
                      {userById[activeThread.userId]?.mobile || activeThread.userId} · deposit & withdraw
                    </p>
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg bg-neutral-50 p-3">
                      {chatMessages.map((message) => (
                        <p key={message.id} className={`max-w-[85%] rounded-lg px-3 py-2 ${message.from === 'admin' ? 'ml-auto bg-[#d7b54a] text-white' : 'bg-white ring-1 ring-neutral-200'}`}>
                          {message.text}
                        </p>
                      ))}
                      {chatMessages.length === 0 && <p className="text-neutral-500">No messages in this thread.</p>}
                    </div>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault()
                        if (!reply.trim()) return
                        sendChatMessage({ uid: activeThread.userId, playerId: activeThread.userId, type: 'chat', text: reply, from: 'admin' })
                          .then(() => setReply(''))
                          .catch(flash)
                      }}
                      className="mt-3 flex shrink-0 gap-2"
                    >
                      <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Type a reply" className="flex-1 rounded-lg border border-neutral-200 px-3 py-2" />
                      <button type="submit" className="rounded-lg bg-[#2ea44f] px-4 py-2 font-medium text-white hover:bg-[#279346]">Send</button>
                    </form>
                  </>
                ) : (
                  <p className="m-auto text-neutral-500">Select a thread to reply.</p>
                )}
              </Card>
            </div>
          )}

          {tab === 'Alerts' && (
            <Card className="max-w-lg space-y-3 p-5">
              <label className="block">
                <span className="mb-1 block text-xs text-neutral-500">One message per line</span>
                <textarea value={alertText} onChange={(event) => setAlertText(event.target.value)} rows={6} className="w-full rounded-lg border border-neutral-200 p-3" placeholder="Result declared for Gali&#10;Play is now open" />
              </label>
              <p className="text-xs text-neutral-500">{alertText.split('\n').filter(Boolean).length} line(s) will be sent to every user.</p>
              <button
                type="button"
                className="rounded-lg bg-[#d7b54a] px-4 py-2 font-medium text-white hover:bg-[#c9a63d]"
                onClick={() => {
                  const lines = alertText.split('\n').filter(Boolean)
                  if (!lines.length) return flash(new Error('Write at least one line.'))
                  broadcastNotification({ lines }).then(() => { ok('Notification sent'); setAlertText('') }).catch(flash)
                }}
              >
                Send to all users
              </button>
            </Card>
          )}

          {tab === 'Postings' && (
            <div className="space-y-3">
              {postings.map((item) => (
                <Card key={item.id} className="p-4">
                  <p>{item.text}</p>
                  <p className="mt-1 text-[11px] text-neutral-500">{userById[item.userId]?.mobile || item.userId} · {item.from}</p>
                  <button
                    type="button"
                    className="mt-2 text-blue-700 hover:underline"
                    onClick={() => {
                      const text = window.prompt('Reply')
                      if (text) sendGamePosting(item.userId, text, 'admin').then(() => ok('Reply posted')).catch(flash)
                    }}
                  >
                    Reply
                  </button>
                </Card>
              ))}
              {postings.length === 0 && <Empty text="No game postings." />}
            </div>
          )}

          {tab === 'Support' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <FilterChip active={supportFilter === 'open'} onClick={() => setSupportFilter('open')}>
                  Open ({tickets.filter((item) => item.status === 'open').length})
                </FilterChip>
                <FilterChip active={supportFilter === 'all'} onClick={() => setSupportFilter('all')}>All ({tickets.length})</FilterChip>
              </div>
              {shownTickets.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{item.mobile}</p>
                    <Pill>{item.status}</Pill>
                  </div>
                  <p className="mt-2">{item.issue}</p>
                  {item.status === 'open' && (
                    <button type="button" className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700" onClick={() => updateTicket(item.id, 'closed').then(() => ok('Ticket closed')).catch(flash)}>
                      Close ticket
                    </button>
                  )}
                </Card>
              ))}
              {shownTickets.length === 0 && <Empty text="No tickets in this view." />}
            </div>
          )}

          {tab === 'Settings' && (
            <SettingsPanel onOk={ok} onError={flash} />
          )}
        </main>
      </div>
    </div>
  )
}
