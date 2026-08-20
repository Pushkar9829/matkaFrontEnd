import { useEffect, useState } from 'react'
import { listenStats } from '../../api/api'
import { Card, money } from '../ui'

const cards = [
  { key: 'users', label: 'Users', tab: 'Users' },
  { key: 'pendingBets', label: 'Pending bets', tab: 'Bets' },
  { key: 'pendingDeposits', label: 'Pending deposits', tab: 'Wallet' },
  { key: 'pendingWithdrawals', label: 'Pending withdrawals', tab: 'Wallet' },
  { key: 'openTickets', label: 'Open tickets', tab: 'Support' },
  { key: 'todayResults', label: 'Results today', tab: 'Results' },
]

export default function DashboardPanel({ onOpenTab, userById }) {
  const [stats, setStats] = useState({})

  useEffect(() => listenStats(setStats), [])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button key={card.key} type="button" onClick={() => onOpenTab(card.tab)} className="text-left">
            <Card className="p-4 hover:ring-[#d7b54a]">
              <p className="text-xs uppercase tracking-wide text-neutral-500">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold">{stats[card.key] || 0}</p>
            </Card>
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 font-semibold">Latest users</h3>
          {(stats.latestUsers || []).map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0">
              <span>{item.mobile}</span>
              <span className="text-neutral-500">{money(item.balance)}</span>
            </div>
          ))}
          {!stats.latestUsers?.length && <p className="text-neutral-500">No users yet.</p>}
        </Card>
        <Card className="p-4">
          <h3 className="mb-3 font-semibold">Latest chats</h3>
          {(stats.latestChats || []).map((item) => (
            <button key={item.id} type="button" onClick={() => onOpenTab('Chat')} className="block w-full border-b border-neutral-100 py-2 text-left last:border-0 hover:bg-amber-50">
              <span className="font-medium">{userById[item.userId]?.mobile || item.userId}</span>
              <span className="block truncate text-xs text-neutral-500">{item.lastText || 'New chat'}</span>
            </button>
          ))}
          {!stats.latestChats?.length && <p className="text-neutral-500">No chats yet.</p>}
        </Card>
      </div>
    </div>
  )
}
