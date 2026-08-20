import { useEffect, useMemo, useState } from 'react'
import { placeBet } from '../../api/api'

const jodiNumbers = Array.from({ length: 100 }, (_, index) => String(index).padStart(2, '0'))
const singleDigits = Array.from({ length: 10 }, (_, index) => String(index))
const tabs = ['Jodi', 'Manual', 'Harraf', 'Crossing', 'Copy Paste']

function pad(value) {
  return String(value).padStart(2, '0')
}

function parseLastTime(lastTime) {
  const [clock, meridian] = lastTime.split(' ')
  const [hoursRaw, minutes, seconds] = clock.split(':').map(Number)
  let hours = hoursRaw
  if (meridian === 'PM' && hours !== 12) hours += 12
  if (meridian === 'AM' && hours === 12) hours = 0
  const date = new Date()
  date.setHours(hours, minutes, seconds || 0, 0)
  if (date.getTime() < Date.now() && meridian === 'AM' && hours < 6) {
    date.setDate(date.getDate() + 1)
  }
  return date
}

function formatRemain(ms) {
  if (ms <= 0) return { text: '00 : 00 : 00', active: false }
  const total = Math.floor(ms / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return { text: `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`, active: true }
}

function NumberCell({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="bg-[#e4c25a] px-3 py-1 text-right text-white">{label}</div>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-neutral-200 px-2 py-1.5 text-center text-neutral-800 outline-none"
      />
    </label>
  )
}

export default function GamePlayPage({ market, pointsRemaining = 0, onBack }) {
  const [tab, setTab] = useState('Jodi')
  const [jodi, setJodi] = useState({})
  const [manualNumber, setManualNumber] = useState('')
  const [manualPoints, setManualPoints] = useState('')
  const [manualBets, setManualBets] = useState([])
  const [andar, setAndar] = useState({})
  const [bahar, setBahar] = useState({})
  const [crossingDigits, setCrossingDigits] = useState('')
  const [crossingPoints, setCrossingPoints] = useState('')
  const [copyText, setCopyText] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [message, setMessage] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const remain = formatRemain(parseLastTime(market.lastTime).getTime() - now)

  const jodiTotal = useMemo(
    () => Object.values(jodi).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [jodi],
  )
  const harrafTotal = useMemo(() => {
    const a = Object.values(andar).reduce((sum, value) => sum + (Number(value) || 0), 0)
    const b = Object.values(bahar).reduce((sum, value) => sum + (Number(value) || 0), 0)
    return a + b
  }, [andar, bahar])
  const manualTotal = useMemo(
    () => manualBets.reduce((sum, bet) => sum + (Number(bet.points) || 0), 0),
    [manualBets],
  )

  const crossingCombos = useMemo(() => {
    const digits = [...new Set(crossingDigits.replace(/\D/g, '').split(''))]
    const pairs = []
    for (let i = 0; i < digits.length; i += 1) {
      for (let j = 0; j < digits.length; j += 1) {
        pairs.push(`${digits[i]}${digits[j]}`)
      }
    }
    return pairs
  }, [crossingDigits])

  const crossingTotal = crossingCombos.length * (Number(crossingPoints) || 0)

  const copyTotal = useMemo(() => {
    return copyText
      .split(/[\n,]+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce((sum, line) => {
        const part = line.split(/[=:\s]+/)
        return sum + (Number(part[1]) || 0)
      }, 0)
  }, [copyText])

  const pointsAdded =
    tab === 'Jodi'
      ? jodiTotal
      : tab === 'Manual'
        ? manualTotal
        : tab === 'Harraf'
          ? harrafTotal
          : tab === 'Crossing'
            ? crossingTotal
            : copyTotal

  function addManual() {
    const number = manualNumber.padStart(2, '0')
    const points = Number(manualPoints)
    if (!/^\d{2}$/.test(number) || !points) return
    setManualBets((current) => [...current, { number, points }])
    setManualNumber('')
    setManualPoints('')
  }

  function handlePlay() {
    if (!pointsAdded) {
      setMessage('Please add points first.')
      return
    }
    let selections = []
    if (tab === 'Jodi') {
      selections = Object.entries(jodi)
        .filter(([, points]) => Number(points) > 0)
        .map(([number, points]) => ({ number, points: Number(points) }))
    } else if (tab === 'Manual') {
      selections = manualBets.map((bet) => ({ number: bet.number, points: Number(bet.points) }))
    } else if (tab === 'Harraf') {
      selections = [
        ...Object.entries(andar)
          .filter(([, points]) => Number(points) > 0)
          .map(([number, points]) => ({ number, points: Number(points), extra: 'andar' })),
        ...Object.entries(bahar)
          .filter(([, points]) => Number(points) > 0)
          .map(([number, points]) => ({ number, points: Number(points), extra: 'bahar' })),
      ]
    } else if (tab === 'Crossing') {
      selections = crossingCombos.map((number) => ({ number, points: Number(crossingPoints) || 0 }))
    } else {
      selections = copyText
        .split(/[\n,]+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const part = line.split(/[=:\s]+/)
          return { number: String(part[0] || '').padStart(2, '0'), points: Number(part[1]) || 0 }
        })
        .filter((item) => item.points > 0)
    }

    setMessage('Submitting...')
    placeBet({ marketId: market.id, type: tab, selections })
      .then(() => {
        setMessage('Play submitted.')
        setJodi({})
        setManualBets([])
        setAndar({})
        setBahar({})
        setCrossingDigits('')
        setCrossingPoints('')
        setCopyText('')
      })
      .catch((error) => setMessage(error.message || 'Play failed.'))
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex items-start justify-between gap-2 bg-[#e4c25a] px-3 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={onBack} aria-label="Go back" className="shrink-0 p-1">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="truncate text-base font-semibold tracking-wide sm:text-lg">{market.name}</h1>
        </div>
        <div className="shrink-0 text-right text-[10px] leading-tight sm:text-[11px]">
          <p>गेम का लास्ट टाइम</p>
          <p>
            {remain.text} | {remain.active ? 'Active' : 'Closed'}
          </p>
        </div>
      </header>

      <div className="bg-[#f0d56a] px-2 py-2 text-center text-xs font-medium text-black sm:text-sm">
        मोटी जोड़ी का लास्ट टाइम : {market.lastTime}
      </div>

      <div className="flex overflow-x-auto border-b border-neutral-200 bg-[#f7f7f7] text-sm">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item)
              setMessage('')
            }}
            className={`min-w-[88px] flex-1 px-3 py-3 ${
              tab === item ? 'border-b-2 border-[#c9a227] font-semibold text-black' : 'text-neutral-600'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm text-[#e4c25a]">Points Remaining</p>
          <p className="text-lg font-medium">{pointsRemaining}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#e4c25a]">Points Added</p>
          <p className="text-lg font-medium">{pointsAdded}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-28 sm:px-5">
        {tab === 'Jodi' && (
          <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:grid-cols-4 sm:gap-3">
            {jodiNumbers.map((number) => (
              <NumberCell
                key={number}
                label={number}
                value={jodi[number] || ''}
                onChange={(value) => setJodi((current) => ({ ...current, [number]: value }))}
              />
            ))}
          </div>
        )}

        {tab === 'Manual' && (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <input
                value={manualNumber}
                onChange={(event) => setManualNumber(event.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="Number"
                className="rounded border border-neutral-300 px-3 py-2"
              />
              <input
                type="number"
                value={manualPoints}
                onChange={(event) => setManualPoints(event.target.value)}
                placeholder="Points"
                className="rounded border border-neutral-300 px-3 py-2"
              />
              <button type="button" onClick={addManual} className="col-span-2 rounded bg-[#2ea44f] py-2 text-white sm:col-span-1">
                Add
              </button>
            </div>
            <div className="space-y-2">
              {manualBets.map((bet, index) => (
                <div key={`${bet.number}-${index}`} className="flex justify-between rounded bg-[#e4c25a] px-3 py-2 text-white">
                  <span>{bet.number}</span>
                  <span>{bet.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Harraf' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 font-medium">Andar Harraf</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {singleDigits.map((digit) => (
                  <NumberCell
                    key={`a-${digit}`}
                    label={digit}
                    value={andar[digit] || ''}
                    onChange={(value) => setAndar((current) => ({ ...current, [digit]: value }))}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium">Bahar Harraf</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {singleDigits.map((digit) => (
                  <NumberCell
                    key={`b-${digit}`}
                    label={digit}
                    value={bahar[digit] || ''}
                    onChange={(value) => setBahar((current) => ({ ...current, [digit]: value }))}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Crossing' && (
          <div>
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              <input
                value={crossingDigits}
                onChange={(event) => setCrossingDigits(event.target.value)}
                placeholder="Digits e.g. 123"
                className="rounded border border-neutral-300 px-3 py-2"
              />
              <input
                type="number"
                value={crossingPoints}
                onChange={(event) => setCrossingPoints(event.target.value)}
                placeholder="Points each"
                className="rounded border border-neutral-300 px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {crossingCombos.map((combo) => (
                <div key={combo} className="bg-[#e4c25a] px-3 py-2 text-center text-white">
                  {combo} = {crossingPoints || 0}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Copy Paste' && (
          <textarea
            value={copyText}
            onChange={(event) => setCopyText(event.target.value)}
            rows={10}
            placeholder={'00=10\n01=20\n23=15'}
            className="w-full rounded border border-neutral-300 p-3 outline-none"
          />
        )}

        {message && <p className="mt-4 text-center text-sm text-green-700">{message}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:px-5">
        <button
          type="button"
          onClick={handlePlay}
          className="w-full rounded-full bg-linear-to-b from-orange-400 to-orange-700 py-3 text-lg font-medium text-white shadow"
        >
          Play
        </button>
      </div>
    </div>
  )
}
