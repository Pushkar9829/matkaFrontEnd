import { useEffect, useState } from 'react'
import { useAuth } from '../../api/AuthContext.jsx'
import { listenNotifications, markNotificationRead } from '../../api/api'

export default function NotificationPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => listenNotifications(user?.uid, setItems), [user?.uid])

  return (
    <div className="min-h-[70vh] bg-[#e8eff5] p-2 sm:p-3">
      <div className="space-y-2 sm:space-y-3">
        {items.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No notifications.</p>}
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm sm:rounded-xl sm:px-4 sm:py-3 ${item.read ? 'opacity-70' : ''}`}
            onClick={() => { if (!item.read) markNotificationRead(item.id) }}
          >
            {(item.lines || []).map((line) => (
              <p key={line} className="text-[13px] leading-relaxed text-neutral-800 sm:text-sm">{line}</p>
            ))}
            <p className="mt-1 text-[12px] font-semibold text-black sm:text-sm">Date:{item.dateLabel || ''}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
