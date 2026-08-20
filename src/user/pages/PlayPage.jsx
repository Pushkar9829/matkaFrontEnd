import { useEffect, useState } from 'react'
import { isMarketTimedOut, listenMarkets } from '../../api/api'

export default function PlayPage({ onPlay }) {
  const [markets, setMarkets] = useState([])
  useEffect(() => listenMarkets(setMarkets), [])

  return (
    <div className="min-h-[70vh] bg-white py-2">
      <div className="flex flex-col gap-1">
        {markets.map((market) => {
          const timeout = isMarketTimedOut(market)
          return (
            <div key={market.id} className="flex items-center justify-between gap-2 bg-[#e4c25a] px-3 py-3 sm:px-4">
              <span className="min-w-0 truncate font-medium tracking-wide text-white">{market.name}</span>
              {timeout ? (
                <span className="shrink-0 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white sm:px-4">Time Out</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPlay(market)}
                  className="shrink-0 rounded-md bg-[#2ea44f] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#279345] sm:px-4"
                >
                  Play Games
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
