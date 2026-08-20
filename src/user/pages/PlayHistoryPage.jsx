import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../api/AuthContext.jsx'
import { listenBets, listenMarkets } from '../../api/api'

const pendingColumns = ['S.NO', 'Date', 'Name', 'Type', 'Number', 'Points', 'Action']
const declaredColumns = ['S.NO', 'Date', 'Name', 'Type', 'Number', 'Points', 'Earned']

function formatBetDate(value) {
  if (!value) return ''
  if (value.toDate) return value.toDate().toLocaleString('en-IN')
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-IN')
}

export default function PlayHistoryPage({ onViewChange }) {
  const { user } = useAuth()
  const [market, setMarket] = useState('')
  const [date, setDate] = useState('')
  const [view, setView] = useState('pending')
  const [markets, setMarkets] = useState([])
  const [rows, setRows] = useState([])
  const [reload, setReload] = useState(0)

  useEffect(() => {
    onViewChange?.(view)
  }, [view, onViewChange])

  useEffect(() => listenMarkets(setMarkets), [])
  useEffect(() => listenBets(user?.uid, view === 'declared' ? 'declared' : 'pending', setRows), [user?.uid, view, reload])

  const columns = view === 'declared' ? declaredColumns : pendingColumns
  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (market && row.marketName !== market && row.marketId !== market) return false
      if (view === 'declared' && date && row.dateKey !== date) return false
      return true
    })
  }, [rows, market, date, view])

  return (
    <div className="play-history">
      <div className="play-history-banner">
        <h2 className="play-history-title">History</h2>
        <div className={`play-history-toolbar${view === 'declared' ? ' is-declared' : ''}`}>
          {view === 'declared' && (
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={`play-history-date${date ? '' : ' is-empty'}`} placeholder="Select date" aria-label="Select date" />
          )}
          <select value={market} onChange={(event) => setMarket(event.target.value)} className="play-history-select">
            <option value="">Select On Market</option>
            {markets.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="play-history-refresh"
            aria-label="Refresh"
            onClick={() => setReload((value) => value + 1)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-2.6-6.3" strokeLinecap="round" />
              <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="play-history-panel">
        <div className="play-history-col">
          <button type="button" onClick={() => setView('pending')} className={`play-history-btn is-green${view === 'pending' ? ' is-on' : ''}`}>Pending Bet</button>
          <p className="play-history-note">जिन गेम का रिजल्ट नही आया वो PENDING BET में दिखेंगी।</p>
        </div>
        <div className="play-history-col">
          <button type="button" onClick={() => setView('declared')} className={`play-history-btn is-orange${view === 'declared' ? ' is-on' : ''}`}>Declared Bet</button>
          <p className="play-history-note">जिन गेम का रिजल्ट आ गया है वो DECLARED BET में दिखेंगी।</p>
        </div>
      </div>

      <div className="play-history-table-wrap">
        <table className="play-history-table">
          <thead>
            <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={columns.length} className="play-history-empty">No data available or something went wrong.</td></tr>
            ) : (
              filtered.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{formatBetDate(row.createdAt)}</td>
                  <td>{row.marketName}</td>
                  <td>{row.type}{row.extra ? ` ${row.extra}` : ''}</td>
                  <td>{row.number}</td>
                  <td>{row.points}</td>
                  <td>{view === 'declared' ? row.earned : row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
