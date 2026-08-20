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
    <div className="min-h-[70vh] bg-[#eef3f8] p-3 sm:p-4">
      <h2 className="mb-3 text-center text-base font-semibold text-neutral-800 sm:mb-4 sm:text-xl">Help</h2>
      <div className="space-y-2 sm:space-y-3">
        {items.map((item) => (
          <p key={item} className="rounded-lg bg-white px-3 py-2 text-[13px] leading-relaxed text-neutral-800 shadow-sm sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
