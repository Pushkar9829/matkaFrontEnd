import { useEffect, useMemo, useState } from 'react'
import { listenContent, requestDeposit } from '../../api/api'

const DEFAULT_NAME = 'SAGAR GENERL STORE'
const DEFAULT_UPI = '8376941024@okbizaxis'
const DEFAULT_WELCOME = 'Welcome to Babaji Matka'
const DEFAULT_WARN =
  'जो पुराना कोड OR History से भुगतान करेगा वो वैध नहीं होगी क्योंकि यहां पर Account Change होता रहता है'

function qrSrc(upi, name, amount) {
  const data = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(data)}`
}

export default function AddPointsPage({ amount, onBack }) {
  const [content, setContent] = useState({})
  const [utr, setUtr] = useState('')
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => listenContent(setContent), [])

  const name = content.depositName || DEFAULT_NAME
  const upi = content.depositUpi || DEFAULT_UPI
  const welcome = content.depositWelcome || DEFAULT_WELCOME
  const warn = content.depositWarning || DEFAULT_WARN
  const qr = content.depositQrUrl || qrSrc(upi, name, amount)

  const utrOk = useMemo(() => /^\d{6,12}$/.test(utr.trim()), [utr])

  function copyUpi() {
    navigator.clipboard?.writeText(upi).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

  function submit() {
    if (!utrOk) {
      setMessage('Enter a 6 to 12 digit UTR number')
      return
    }
    setBusy(true)
    setMessage('')
    requestDeposit({ amount, utr: utr.trim() })
      .then(() => {
        setMessage('Payment submitted. Points will be added after approval.')
        setTimeout(() => onBack?.(), 1200)
      })
      .catch((error) => setMessage(error.message || 'Submit failed.'))
      .finally(() => setBusy(false))
  }

  return (
    <div className="pay-page">
      <p className="pay-warn">{warn}</p>

      <div className="pay-wrap">
        <h2 className="pay-welcome">{welcome}</h2>

        <div className="pay-card">
          <p className="pay-line">Name : {name}</p>
          <div className="pay-upi-row">
            <p className="pay-line">Upi ID : {upi}</p>
            <button type="button" className="pay-copy" onClick={copyUpi}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="pay-qr-box">
            <img src={qr} alt="Pay QR" />
          </div>

          <p className="pay-hint">
            UPI ID या QR CODE पैमेंट करके नीचे पेमेंट का UTR नंबर डाल दो !
          </p>
        </div>

        <label className="pay-utr-label">Unique Transaction Reference *</label>
        <input
          className="pay-utr"
          value={utr}
          inputMode="numeric"
          maxLength={12}
          placeholder="6 to 12 Digital UTR Number"
          onChange={(event) => setUtr(event.target.value.replace(/\D/g, '').slice(0, 12))}
        />

        <button type="button" className="pay-submit" disabled={busy} onClick={submit}>
          SUBMIT
        </button>
        {message && <p className="pay-message">{message}</p>}
        <button type="button" className="pay-back" onClick={onBack}>Back to Wallet</button>
      </div>
    </div>
  )
}
