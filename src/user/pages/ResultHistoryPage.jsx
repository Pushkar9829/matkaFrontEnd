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
      label: date.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    })
  }
  return options
}

export default function ResultHistoryPage() {
  const months = useMemo(() => monthOptions(), [])
  const [month, setMonth] = useState(months[0]?.value || '')
  const [appliedMonth, setAppliedMonth] = useState(months[0]?.value || '')
  const [markets, setMarkets] = useState([])
  const [rows, setRows] = useState([])

  useEffect(() => listenMarkets(setMarkets), [])
  useEffect(() => {
    if (!appliedMonth || !markets.length) return undefined
    loadMonthResults(appliedMonth, markets).then(setRows).catch(() => setRows([]))
    return undefined
  }, [appliedMonth, markets])

  const selected = months.find((item) => item.value === appliedMonth)
  const bannerMonth = selected ? selected.label.replace(/ \d{4}$/, '') : ''

  return (
    <div className="min-h-[70vh] bg-[#0b2a6e] pb-4">
      <div className="bg-white px-3 py-3">
        <div className="rounded-sm border-2 border-dashed border-black bg-[#f5d000] py-3 text-center text-xl font-medium text-black">
          {bannerMonth} Month Result
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 px-3 py-4">
        <select value={month} onChange={(event) => setMonth(event.target.value)} className="min-w-[180px] rounded-md border-0 bg-white px-4 py-2 text-neutral-800 outline-none">
          {months.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <button type="button" onClick={() => setAppliedMonth(month)} className="rounded-lg bg-[#1e90ff] px-6 py-2 font-semibold text-white shadow hover:bg-[#1877d6]">
          Get Result
        </button>
      </div>

      <div className="overflow-x-auto px-1">
        <table className="w-full min-w-[1100px] border-collapse text-center text-sm text-white">
          <thead>
            <tr className="bg-[#f5d000] text-black">
              <th className="border border-[#0b2a6e] px-2 py-2 font-semibold">Date</th>
              {markets.map((market) => (
                <th key={market.id} className="border border-[#0b2a6e] px-2 py-2 font-semibold">{market.shortName || market.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={markets.length + 1} className="px-3 py-8 text-white">No data available or something went wrong.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.date}>
                  <td className="border border-[#1a3f86] px-2 py-2 font-semibold text-[#ff6a00]">{row.date}</td>
                  {row.values.map((value, index) => (
                    <td key={`${row.date}-${index}`} className="border border-[#1a3f86] px-2 py-2">{value}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
