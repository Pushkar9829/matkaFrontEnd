import { useEffect, useMemo, useState } from 'react'
import { placeBet } from '../../api/api'

const jodiNumbers = Array.from({ length: 100 }, (_, index) => String(index).padStart(2, '0'))
const harufLabels = ['111', '222', '333', '444', '555', '666', '777', '888', '999', '000']
const tabs = ['Jodi', 'Manual', 'Harraf', 'Crossing', 'Copy Paste']
const emptyManualRows = () => Array.from({ length: 12 }, () => ({ jodi: '', point: '' }))

function pad(value) {
  return String(value).padStart(2, '0')
}

function parseLastTime(lastTime) {
  if (!lastTime) return new Date()
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
    <label className="gp-cell">
      <span className="gp-cell-label">{label}</span>
      <input
        className="gp-cell-input"
        type="number"
        min="0"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function playLabel(tab) {
  if (tab === 'Jodi' || tab === 'Copy Paste') return 'Play'
  if (tab === 'Crossing') return 'Place bet'
  return 'Place Bet'
}

export default function GamePlayPage({ market, pointsRemaining = 0, onBack }) {
  const [tab, setTab] = useState('Jodi')
  const [jodi, setJodi] = useState({})
  const [manualRows, setManualRows] = useState(emptyManualRows)
  const [andar, setAndar] = useState({})
  const [bahar, setBahar] = useState({})
  const [crossA, setCrossA] = useState('')
  const [crossB, setCrossB] = useState('')
  const [crossPoints, setCrossPoints] = useState('')
  const [crossBets, setCrossBets] = useState([])
  const [copyNumber, setCopyNumber] = useState('')
  const [copyAmount, setCopyAmount] = useState('')
  const [withPalti, setWithPalti] = useState(true)
  const [copyBets, setCopyBets] = useState([])
  const [now, setNow] = useState(() => Date.now())
  const [message, setMessage] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const gameEnd = parseLastTime(market.lastTime)
  const remain = formatRemain(gameEnd.getTime() - now)
  const motiRemain = formatRemain(gameEnd.getTime() - 30 * 60 * 1000 - now)

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
    () => manualRows.reduce((sum, row) => sum + (Number(row.point) || 0), 0),
    [manualRows],
  )
  const crossingTotal = useMemo(
    () => crossBets.reduce((sum, bet) => sum + (Number(bet.points) || 0), 0),
    [crossBets],
  )
  const copyTotal = useMemo(
    () => copyBets.reduce((sum, bet) => sum + (Number(bet.points) || 0), 0),
    [copyBets],
  )

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

  const showTotalBar = tab === 'Crossing' || tab === 'Copy Paste'

  function updateManual(index, key, value) {
    setManualRows((current) => {
      const next = current.map((row, rowIndex) => (
        rowIndex === index ? { ...row, [key]: value } : row
      ))
      const last = next[next.length - 1]
      if (last.jodi || last.point) next.push({ jodi: '', point: '' })
      return next
    })
  }

  function addCrossing() {
    const left = crossA.replace(/\D/g, '')
    const right = crossB.replace(/\D/g, '')
    const points = Number(crossPoints)
    if (!left || !right || !points) return
    const pairs = []
    for (const a of left) {
      for (const b of right) pairs.push(`${a}${b}`)
    }
    setCrossBets((current) => [
      ...current,
      ...pairs.map((number) => ({ type: 'Crossing', number, points })),
    ])
    setCrossA('')
    setCrossB('')
    setCrossPoints('')
  }

  function addCopy() {
    const digits = copyNumber.replace(/\D/g, '')
    const points = Number(copyAmount)
    if (digits.length < 2 || !points) return
    const pairs = []
    for (let i = 0; i < digits.length - 1; i += 1) {
      const number = digits[i] + digits[i + 1]
      pairs.push(number)
      if (withPalti && number[0] !== number[1]) pairs.push(number[1] + number[0])
    }
    setCopyBets((current) => [
      ...current,
      ...[...new Set(pairs)].map((number) => ({
        type: withPalti ? 'With Palti' : 'Without Palti',
        number,
        points,
      })),
    ])
    setCopyNumber('')
    setCopyAmount('')
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
      selections = manualRows
        .filter((row) => row.jodi && Number(row.point) > 0)
        .map((row) => ({ number: String(row.jodi).padStart(2, '0'), points: Number(row.point) }))
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
      selections = crossBets.map((bet) => ({ number: bet.number, points: Number(bet.points) }))
    } else {
      selections = copyBets.map((bet) => ({ number: bet.number, points: Number(bet.points), extra: bet.type }))
    }

    setMessage('Submitting...')
    placeBet({ marketId: market.id, type: tab, selections })
      .then(() => {
        setMessage('Play submitted.')
        setJodi({})
        setManualRows(emptyManualRows())
        setAndar({})
        setBahar({})
        setCrossBets([])
        setCopyBets([])
      })
      .catch((error) => setMessage(error.message || 'Play failed.'))
  }

  return (
    <div className="gp-page">
      <header className="gp-head">
        <div className="gp-head-left">
          <button type="button" onClick={onBack} aria-label="Go back" className="gp-back">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1>{market.name}</h1>
        </div>
        <div className="gp-head-time">
          <p>गेम का लास्ट टाइम</p>
          <p>
            {remain.text} | {remain.active ? 'Active' : 'Closed'}
          </p>
        </div>
      </header>

      <div className="gp-subhead">मोटी जोड़ी का लास्ट टाइम : {motiRemain.text}</div>

      <div className="gp-tabs">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item)
              setMessage('')
            }}
            className={`gp-tab${tab === item ? ' is-on' : ''}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="gp-points">
        <div className="gp-points-block">
          <p className="gp-points-label">Points Remaining</p>
          <p className="gp-points-value">{pointsRemaining}</p>
        </div>
        <div className="gp-points-block">
          <p className="gp-points-label">Points Added</p>
          <p className="gp-points-value">{pointsAdded}</p>
        </div>
      </div>

      <div className={`gp-body${showTotalBar ? ' has-bar' : ''}`}>
        {tab === 'Jodi' && (
          <div className="gp-jodi">
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
          <>
            <table className="gp-sheet">
              <thead>
                <tr>
                  <th>Jodi</th>
                  <th>Point</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {manualRows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        value={row.jodi}
                        inputMode="numeric"
                        onChange={(event) => updateManual(index, 'jodi', event.target.value.replace(/\D/g, '').slice(0, 2))}
                      />
                    </td>
                    <td>
                      <input
                        value={row.point}
                        inputMode="numeric"
                        onChange={(event) => updateManual(index, 'point', event.target.value.replace(/\D/g, ''))}
                      />
                    </td>
                    <td>{row.point || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="gp-total-label">Total Points</p>
          </>
        )}

        {tab === 'Harraf' && (
          <>
            <p className="gp-section">Andar Haruf</p>
            <div className="gp-haruf">
              {harufLabels.map((label) => {
                const digit = label[0]
                return (
                  <NumberCell
                    key={`a-${digit}`}
                    label={label}
                    value={andar[digit] || ''}
                    onChange={(value) => setAndar((current) => ({ ...current, [digit]: value }))}
                  />
                )
              })}
            </div>
            <p className="gp-section">Bahar Haruf</p>
            <div className="gp-haruf">
              {harufLabels.map((label) => {
                const digit = label[0]
                return (
                  <NumberCell
                    key={`b-${digit}`}
                    label={label}
                    value={bahar[digit] || ''}
                    onChange={(value) => setBahar((current) => ({ ...current, [digit]: value }))}
                  />
                )
              })}
            </div>
          </>
        )}

        {tab === 'Crossing' && (
          <>
            <div className="gp-cross-row">
              <label className="gp-field">
                <span>Number</span>
                <input value={crossA} placeholder="Number" onChange={(event) => setCrossA(event.target.value)} />
              </label>
              <label className="gp-field">
                <span>Number</span>
                <input value={crossB} placeholder="Number" onChange={(event) => setCrossB(event.target.value)} />
              </label>
            </div>
            <label className="gp-field">
              <span>Points</span>
              <input value={crossPoints} placeholder="Points" inputMode="numeric" onChange={(event) => setCrossPoints(event.target.value)} />
            </label>
            <button type="button" className="gp-add" onClick={addCrossing}>Add</button>
            <table className="gp-list">
              <thead>
                <tr>
                  <th>Number Type</th>
                  <th>Number</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {crossBets.map((bet, index) => (
                  <tr key={`${bet.number}-${index}`}>
                    <td>{bet.type}</td>
                    <td>{bet.number}</td>
                    <td>{bet.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === 'Copy Paste' && (
          <>
            <label className="gp-field">
              <span>Number</span>
              <input value={copyNumber} placeholder="Number" onChange={(event) => setCopyNumber(event.target.value)} />
            </label>
            <div className="gp-radios">
              <label>
                <input type="radio" checked={withPalti} onChange={() => setWithPalti(true)} />
                With Palti
              </label>
              <label>
                <input type="radio" checked={!withPalti} onChange={() => setWithPalti(false)} />
                Without Palti
              </label>
            </div>
            <label className="gp-field">
              <span>Amount</span>
              <input value={copyAmount} placeholder="Number" inputMode="numeric" onChange={(event) => setCopyAmount(event.target.value)} />
            </label>
            <button type="button" className="gp-add" onClick={addCopy}>Add</button>
            <table className="gp-list">
              <thead>
                <tr>
                  <th>Number Type</th>
                  <th>Number</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {copyBets.map((bet, index) => (
                  <tr key={`${bet.number}-${index}`}>
                    <td>{bet.type}</td>
                    <td>{bet.number}</td>
                    <td>{bet.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {message && <p className="gp-message">{message}</p>}
      </div>

      {showTotalBar ? (
        <div className="gp-foot">
          <div className="gp-foot-total">
            <span>Total Points</span>
            <span>{pointsAdded}</span>
          </div>
          <button type="button" className="gp-play" onClick={handlePlay}>
            {playLabel(tab)}
          </button>
        </div>
      ) : (
        <div className="gp-foot is-simple">
          <button type="button" className="gp-play" onClick={handlePlay}>
            {playLabel(tab)}
          </button>
        </div>
      )}
    </div>
  )
}
