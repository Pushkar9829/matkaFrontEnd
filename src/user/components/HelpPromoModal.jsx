import { useEffect, useRef, useState } from 'react'
import logo from '../../assets/logo.png'
import { listenContent } from '../../api/api'

const HINDI_TEXT =
  'अगर आपको पैसा एड करने में, पैसा निकालने में और गेम खेलने में कोई समस्या होती है तो आप HELP में जाके वीडियो देख सकते हो और हमसे बात भी कर सकते हो'
const OLD_HINDI_TEXT =
  'अगर आपको पैसा एड करने मैं, पैसा निकालने मैं और गेम खेलने मैं कोई समस्या होती है तो आप HELP मैं जाके वीडियो देख सकते हो और हमसे बात भी कर सकते हो'

export default function HelpPromoModal({ onChat, onHelp, initialDelayMs = 2000, intervalMs = 45000 }) {
  const [open, setOpen] = useState(false)
  const [promo, setPromo] = useState(HINDI_TEXT)
  const shownOnce = useRef(false)

  useEffect(() => listenContent((content) => {
    if (!content.helpPromo || content.helpPromo === OLD_HINDI_TEXT) setPromo(HINDI_TEXT)
    else setPromo(content.helpPromo)
  }), [])

  useEffect(() => {
    if (open) {
      shownOnce.current = true
      return undefined
    }
    const delay = shownOnce.current ? intervalMs : initialDelayMs
    const id = setTimeout(() => setOpen(true), delay)
    return () => clearTimeout(id)
  }, [open, initialDelayMs, intervalMs])

  if (!open) return null

  function close() {
    setOpen(false)
  }

  return (
    <div className="help-promo-overlay">
      <div className="help-promo" role="dialog" aria-modal="true">
        <button type="button" className="help-promo-close" onClick={close} aria-label="Close">
          ×
        </button>
        <p className="help-promo-text">{promo}</p>
        <div className="help-promo-actions">
          <button
            type="button"
            className="help-promo-circle"
            onClick={() => {
              close()
              onChat?.()
            }}
          >
            Chat
          </button>
          <div className="help-promo-logo-wrap">
            <img className="help-promo-logo" src={logo} alt="RPK 90" />
          </div>
          <button
            type="button"
            className="help-promo-circle"
            onClick={() => {
              close()
              onHelp?.()
            }}
          >
            Help
          </button>
        </div>
      </div>
    </div>
  )
}
