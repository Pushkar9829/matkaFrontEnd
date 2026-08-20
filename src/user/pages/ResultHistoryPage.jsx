import { useEffect, useMemo, useState } from 'react'
import { listenMarkets, loadMonthResults } from '../../api/api'

function monthOptions() {
  const options = []
  const now = new Date()
  for (let i = 0; i < 6; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    options.push({
      value,
      label: date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    })
  }
  return options
}

function daysInMonth(month) {
  const [year, monthIndex] = month.split('-').map(Number)
  const last = new Date(year, monthIndex, 0).getDate()
  return Array.from({ length: last }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    return `${year}-${String(monthIndex).padStart(2, '0')}-${day}`
  })
}

function formatDisplayDate(iso) {
  const [year, month, day] = String(iso).split('-')
  if (!day) return iso
  return `${day}-${month}-${year}`
}

export default function ResultHistoryPage() {
  const months = useMemo(() => monthOptions(), [])
  const [month, setMonth] = useState(months[0]?.value || '')
  const [appliedMonth, setAppliedMonth] = useState(months[0]?.value || '')
  const [markets, setMarkets] = useState([])
  const [byDate, setByDate] = useState({})

  useEffect(() => listenMarkets(setMarkets), [])
  useEffect(() => {
    if (!appliedMonth || !markets.length) return undefined
    loadMonthResults(appliedMonth, markets)
      .then((rows) => {
        const next = {}
        rows.forEach((row) => {
          next[row.date] = row.values
        })
        setByDate(next)
      })
      .catch(() => setByDate({}))
    return undefined
  }, [appliedMonth, markets])

  const selected = months.find((item) => item.value === appliedMonth)
  const bannerMonth = selected ? selected.label.replace(/ \d{4}$/, '') : ''
  const rows = useMemo(() => {
    if (!appliedMonth) return []
    return daysInMonth(appliedMonth).map((date) => ({
      date,
      values: byDate[date] || markets.map(() => ''),
    }))
  }, [appliedMonth, byDate, markets])

  return (
    <div className="rh-page">
      <div className="rh-top">
        <div className="rh-banner">{bannerMonth} Month Result</div>
      </div>

      <div className="rh-controls">
        <select value={month} onChange={(event) => setMonth(event.target.value)} className="rh-select">
          {months.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <button type="button" className="rh-go" onClick={() => setAppliedMonth(month)}>
          Get Result
        </button>
      </div>

      <div className="rh-table-wrap">
        <table className="rh-table">
          <thead>
            <tr>
              <th>Date</th>
              {markets.map((market) => (
                <th key={market.id}>{market.shortName || market.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date}>
                <td className="is-date">{formatDisplayDate(row.date)}</td>
                {row.values.map((value, index) => (
                  <td key={`${row.date}-${index}`}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
