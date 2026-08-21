import { useEffect, useState } from 'react'
import { loadUserDetail, setUserBlocked, adjustBalance, setUserPin } from '../../api/api'
import { Card, Empty, FilterChip, Pill, betOutcome, money, primaryBtn } from '../ui'

const views = ['Bets', 'Deposits', 'Withdrawals', 'Wallet', 'Chat']

export default function UserDetail({ user, onBack, onError, onOk }) {
  const [detail, setDetail] = useState(null)
  const [view, setView] = useState('Bets')
  const [adjust, setAdjust] = useState({ amount: '', reason: '' })
  const [pin, setPin] = useState('')

  useEffect(() => {
    loadUserDetail(user.id).then(setDetail).catch(onError)
  }, [user.id])

  if (!detail) {
    return <Card className="p-6 text-neutral-500">Loading user…</Card>
  }

  const player = detail.user

  function refresh() {
    loadUserDetail(user.id).then(setDetail).catch(onError)
  }

  return (
    <div className="space-y-4">
      <button type="button" className="text-sm text-blue-700 hover:underline" onClick={onBack}>
        ← Back to users
      </button>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{player.mobile}</p>
            <p className="text-xs text-neutral-400">{player.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{player.blocked ? 'Blocked' : 'Active'}</Pill>
            <button
              type="button"
              className="text-blue-700 hover:underline"
              onClick={() => setUserBlocked({ userId: player.id, blocked: !player.blocked }).then(refresh).catch(onError)}
            >
              {player.blocked ? 'Unblock' : 'Block'}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-neutral-50 p-3"><p className="text-xs text-neutral-500">Number</p><p className="font-semibold tracking-wide">{player.mobile || '—'}</p></div>
          <div className="rounded-lg bg-neutral-50 p-3"><p className="text-xs text-neutral-500">MPIN</p><p className="font-mono font-semibold">{player.mpin || '—'}</p></div>
          <div className="rounded-lg bg-neutral-50 p-3"><p className="text-xs text-neutral-500">Balance</p><p className="font-semibold">{money(player.balance)}</p></div>
          <div className="rounded-lg bg-neutral-50 p-3"><p className="text-xs text-neutral-500">Win amount</p><p className="font-semibold">{money(player.winAmount)}</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <input value={pin} onChange={(event) => setPin(event.target.value)} placeholder="New MPIN" className="w-full rounded-lg border border-neutral-200 px-3 py-2 sm:w-36" />
          <button
            type="button"
            className={primaryBtn}
            onClick={() => setUserPin({ userId: player.id, mpin: pin })
              .then(() => { onOk('MPIN updated'); setPin(''); refresh() })
              .catch(onError)}
          >
            Set PIN
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={adjust.amount} onChange={(event) => setAdjust((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount (+ / −)" className="w-full rounded-lg border border-neutral-200 px-3 py-2 sm:w-32" />
          <input value={adjust.reason} onChange={(event) => setAdjust((current) => ({ ...current, reason: event.target.value }))} placeholder="Reason" className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2" />
          <button
            type="button"
            className={primaryBtn}
            onClick={() => adjustBalance({ userId: player.id, amount: Number(adjust.amount), reason: adjust.reason })
              .then(() => { onOk('Balance updated'); setAdjust({ amount: '', reason: '' }); refresh() })
              .catch(onError)}
          >
            Adjust
          </button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {views.map((item) => (
          <FilterChip key={item} active={view === item} onClick={() => setView(item)}>
            {item}
          </FilterChip>
        ))}
      </div>

      {view === 'Bets' && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-brand text-white">
                <th className="p-3 font-medium">Market</th>
                <th className="font-medium">Type</th>
                <th className="font-medium">Number</th>
                <th className="font-medium">Points</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Earned</th>
              </tr>
            </thead>
            <tbody>
              {detail.bets.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="p-3">{item.marketName}</td>
                  <td>{item.type}{item.extra ? ` ${item.extra}` : ''}</td>
                  <td className="font-medium">{item.number}</td>
                  <td>{item.points}</td>
                  <td><Pill>{betOutcome(item)}</Pill></td>
                  <td>{money(item.earned)}</td>
                </tr>
              ))}
              {detail.bets.length === 0 && <tr><td className="p-6 text-neutral-500" colSpan={6}>No bets.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {view === 'Deposits' && (
        <Card className="p-4">
          {detail.deposits.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0">
              <span>{money(item.amount)} · {item.dateLabel}</span>
              <Pill>{item.status}</Pill>
            </div>
          ))}
          {detail.deposits.length === 0 && <Empty text="No deposits." />}
        </Card>
      )}

      {view === 'Withdrawals' && (
        <Card className="p-4">
          {detail.withdrawals.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0">
              <span>{money(item.amount)} · {item.dateLabel}</span>
              <Pill>{item.status}</Pill>
            </div>
          ))}
          {detail.withdrawals.length === 0 && <Empty text="No withdrawals." />}
        </Card>
      )}

      {view === 'Wallet' && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="bg-brand text-white">
                <th className="p-3 font-medium">Mode</th>
                <th className="font-medium">Points</th>
                <th className="font-medium">Closing</th>
                <th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {detail.wallet.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="p-3">{item.payMode}</td>
                  <td>{item.points}</td>
                  <td>{item.closing}</td>
                  <td><Pill>{item.status}</Pill></td>
                </tr>
              ))}
              {detail.wallet.length === 0 && <tr><td className="p-6 text-neutral-500" colSpan={4}>No wallet rows.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {view === 'Chat' && (
        <Card className="max-h-[480px] space-y-2 overflow-y-auto p-4">
          {detail.messages.map((message) => (
            <p key={message.id} className={`max-w-[85%] rounded-lg px-3 py-2 ${message.from === 'admin' ? 'ml-auto bg-brand text-white' : 'bg-neutral-100'}`}>
              {message.text}
            </p>
          ))}
          {detail.messages.length === 0 && <Empty text="No chat yet." />}
        </Card>
      )}
    </div>
  )
}
