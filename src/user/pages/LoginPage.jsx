import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import SupportButton from '../components/SupportButton'
import SupportModal from '../components/SupportModal'
import CreateMpinModal from '../components/CreateMpinModal'
import { authErrorMessage, loginUser } from '../../api/auth'
import { listenContent } from '../../api/api'

function PersonIcon() {
  return (
    <svg className="login-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
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
    <div className="gold-page min-h-dvh">
      <div className="login-banner-wrap">
        <p className="login-banner">
          गली दिसावर सट्टा खेलने वाले एप्लीकेशन डाउनलोड करे! रेट 10 के 950
        </p>
      </div>

      <div className="login-wrap">
        <form className="login-card" onSubmit={handleLogin}>
          <img className="login-logo" src={logo} alt="RPK 90" />

          <label className="login-label" htmlFor="mobile">
            Mobile Number
          </label>
          <div className="login-field boxed">
            <PersonIcon />
            <input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Mobile Number"
              required
              maxLength={10}
              pattern="[0-9]{10}"
              onInput={(event) => {
                event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 10)
              }}
            />
          </div>

          <label className="login-label" htmlFor="mpin">
            MPIN <span className="login-ex">(ex.A12345)</span>
          </label>
          <div className="login-field boxed">
            <PersonIcon />
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
