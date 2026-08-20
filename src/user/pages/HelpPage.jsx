import { useEffect, useState } from 'react'
import { listenContent } from '../../api/api'

export default function HelpPage() {
  const [content, setContent] = useState({})
  useEffect(() => listenContent(setContent), [])
  const items = content.help?.length
    ? content.help
    : [
        'Deposit: Wallet > Add Point, then send payment proof in Chat.',
        'Withdraw: Wallet > Withdraw, save bank details, then confirm in Chat.',
        'Play: open Play, pick a market before last time, enter points, tap Play.',
      ]

  return (
    <div className="min-h-[70vh] bg-[#eef3f8] p-4">
      <h2 className="mb-4 text-center text-xl font-semibold text-neutral-800">Help</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <p key={item} className="rounded-xl bg-white px-4 py-3 text-sm leading-relaxed text-neutral-800 shadow-sm">
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
