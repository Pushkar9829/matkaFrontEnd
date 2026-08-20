import { useEffect, useState } from 'react'
import { isMarketTimedOut, listenMarkets } from '../../api/api'

export default function PlayPage({ onPlay }) {
  const [markets, setMarkets] = useState([])
  useEffect(() => listenMarkets(setMarkets), [])

  return (
    <div className="play-page">
      {markets.map((market) => {
        const timeout = isMarketTimedOut(market)
        return (
          <div key={market.id} className="play-row">
            <span className="play-row-name">{market.name}</span>
            {timeout ? (
              <span className="play-row-btn is-timeout">Time Out</span>
            ) : (
              <button type="button" className="play-row-btn is-play" onClick={() => onPlay(market)}>
                Play Games
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
