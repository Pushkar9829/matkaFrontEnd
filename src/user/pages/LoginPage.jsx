import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import SupportButton from '../components/SupportButton'
import SupportModal from '../components/SupportModal'
import CreateMpinModal from '../components/CreateMpinModal'
import { authErrorMessage, loginUser } from '../../api/auth'
import { listenContent } from '../../api/api'

function SearchIcon() {
  return (
    <svg className="login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
    </svg>
  )
}

function openLink(url) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function LoginPage() {
  const [supportOpen, setSupportOpen] = useState(false)
  const [createMpinOpen, setCreateMpinOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [content, setContent] = useState({})

  useEffect(() => listenContent(setContent), [])

  async function handleLogin(event) {
    event.preventDefault()
    const form = new FormData(event.target)
    setError('')
    setBusy(true)
    try {
      await loginUser(form.get('mobile'), form.get('mpin'))
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gold-page min-h-screen">
      <div className="bg-white px-3 py-2 text-center">
        <p className="text-[15px] font-bold text-green-700 sm:text-lg">
          गली दिसावर सट्टा खेलने वाले एप्लीकेशन डाउनलोड करे! रेट 10 के 950
        </p>
      </div>

      <div className="login-wrap">
        <form className="login-card" onSubmit={handleLogin}>
          <img className="login-logo" src={logo} alt="RPK 90" />

          <label className="login-label" htmlFor="mobile">
            Mobile Number
          </label>
          <div className="login-field">
            <SearchIcon />
            <input id="mobile" name="mobile" type="tel" placeholder="Mobile Number" required />
          </div>

          <label className="login-label" htmlFor="mpin">
            MPIN <span className="login-ex">(ex.A12345)</span>
          </label>
          <div className="login-field boxed">
            <SearchIcon />
            <input id="mpin" name="mpin" type="password" placeholder="MPIN" required minLength={6} />
          </div>

          <button type="button" className="login-create" onClick={() => setCreateMpinOpen(true)}>
            Create New MPIN
          </button>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={busy}>
            {busy ? 'Please wait...' : 'Login'}
          </button>
          <button type="button" className="install-btn" onClick={() => openLink(content.apkUrl)}>
            Install Application 1
          </button>
          <button type="button" className="install-btn" onClick={() => openLink(content.apkUrl2 || content.apkUrl)}>
            Install Application 2
          </button>
        </form>
      </div>

      <SupportButton onClick={() => setSupportOpen(true)} />
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
      <CreateMpinModal
        open={createMpinOpen}
        onClose={() => setCreateMpinOpen(false)}
        onError={setError}
      />
    </div>
  )
}
