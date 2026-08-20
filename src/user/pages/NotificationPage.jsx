import { useEffect, useState } from 'react'
import { useAuth } from '../../api/AuthContext.jsx'
import { listenNotifications, markNotificationRead } from '../../api/api'

export default function NotificationPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => listenNotifications(user?.uid, setItems), [user?.uid])

  return (
    <div className="min-h-[70vh] bg-[#e8eef4] p-3">
      <div className="space-y-3">
        {items.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No notifications.</p>}
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm ${item.read ? 'opacity-70' : ''}`}
            onClick={() => { if (!item.read) markNotificationRead(item.id) }}
          >
            {(item.lines || []).map((line) => (
              <p key={line} className="text-sm leading-relaxed text-neutral-800">{line}</p>
            ))}
            <p className="mt-1 text-sm font-semibold text-black">Date:{item.dateLabel || ''}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
