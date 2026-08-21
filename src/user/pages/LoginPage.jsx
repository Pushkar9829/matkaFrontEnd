import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import support from '../../assets/support.png'
import { authErrorMessage, loginUser, registerUser } from '../../api/auth'
import { listenContent, submitSupportTicket } from '../../api/api'

const DEFAULT_TITLE = 'गली दिसावर सट्टा खेलने वाले एप्लीकेशन डाउनलोड करे! रेट 10 के 950'
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

function PersonIcon() {
  return <i className="bi bi-person site-form-item-icon" aria-hidden="true" />
}

function checkStrength(pwd, setColor, setIsValidMpin) {
  const hasLetter = /[a-zA-Z]/.test(pwd)
  const hasNumber = /[0-9]/.test(pwd)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
  const hasRepeat = /(.)\1/.test(pwd)

  if (hasSpecial) {
    setColor('red')
    setIsValidMpin(false)
    return 'Only AlphaNumberic Allowed'
  }
  if (hasRepeat) {
    setColor('red')
    setIsValidMpin(false)
    return 'Repeated Not Allowed'
  }
  if (hasLetter && hasNumber && pwd.length >= 6) {
    setColor('green')
    setIsValidMpin(true)
    return 'Perfect 👍'
  }
  if (hasLetter || hasNumber) {
    setColor('orange')
    setIsValidMpin(false)
    return 'Weak'
  }
  setColor('red')
  setIsValidMpin(false)
  return 'Invalid'
}

function OffCanvasExample({ name }) {
  const [show, setShow] = useState(false)
  return (
    <>
      <div className={`ios-offcanvas ${show ? 'is-open' : ''}`}>
        <div className="offcanvas-header">
          <div className="offcanvas-title text-white border-bottom-custum">Add To Home Screen</div>
          <div className="cancelbtn" onClick={() => setShow(false)}>
            Cancel
          </div>
        </div>
        <div className="offcanvas-body text-white">
          <p className="text-center text-white content-pwa">
            This website has app functionality. Add it to your home screen to use it in fullscreen and while offline.
          </p>
          <ul className="list-style-none">
            <li className="d-flex">
              <i className="bi bi-box-arrow-up arrowcolor" />
              <span>1 Press the 'Share' button</span>
            </li>
            <li>
              <i className="bi bi-plus-square" />
              <span>2 Press 'Add to Home Screen'</span>
            </li>
          </ul>
        </div>
      </div>
      {show && <div className="ios-offcanvas-backdrop" onClick={() => setShow(false)} />}
      <button type="button" className="btn btn-ronded text-light pwabtn" onClick={() => setShow(true)}>
        {name}
      </button>
    </>
  )
}

export default function LoginPage() {
  const [loadingsplash, setloadingsplash] = useState(true)
  const [view, setView] = useState('login')
  const [mobile, setMobile] = useState('')
  const [mpin, setMpin] = useState('')
  const [confirmMpin, setConfirmMpin] = useState('')
  const [isValidMobile, setIsValidMobile] = useState(false)
  const [isValidMpin, setIsValidMpin] = useState(false)
  const [message, setMessage] = useState('')
  const [color, setColor] = useState('black')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState({})
  const [showPopup, setShowPopup] = useState(false)
  const [formData, setFormData] = useState({ issuemobile: '', description: '' })
  const [supportMsg, setSupportMsg] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(true)

  useEffect(() => {
    const splashTimeout = setTimeout(() => setloadingsplash(false), 4000)
    return () => clearTimeout(splashTimeout)
  }, [])

  useEffect(() => listenContent(setContent), [])

  useEffect(() => {
    const beforeInstallPromptHandler = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler)
    return () => window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler)
  }, [])

  useEffect(() => {
    if (localStorage.getItem('isAppInstalled')) setShowInstallButton(false)
  }, [])

  function onInputChange(event) {
    const mobileNumber = event.target.value.replace(/\D/g, '').slice(0, 10)
    setMobile(mobileNumber)
    setIsValidMobile(/^[0-9]{10}$/.test(mobileNumber))
  }

  function handleChangeMpin(event) {
    const input = event.target.value
    setMpin(input)
    setMessage(checkStrength(input, setColor, setIsValidMpin))
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!isValidMobile) return
    setError('')
    setLoading(true)
    try {
      await loginUser(mobile, mpin)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function onCreateMpin(event) {
    event.preventDefault()
    if (!isValidMobile) return
    if (mpin !== confirmMpin) {
      setError('MPIN and Confirm MPIN do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await registerUser(mobile, mpin)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    if (choiceResult.outcome === 'accepted') {
      localStorage.setItem('isAppInstalled', 'true')
      setShowInstallButton(false)
    }
    setDeferredPrompt(null)
  }

  async function handleSubmitIssue(event) {
    event.preventDefault()
    setSupportMsg('')
    try {
      await submitSupportTicket({
        mobile: String(formData.issuemobile || ''),
        issue: String(formData.description || ''),
      })
      setSupportMsg('Submit Successfully')
      setFormData({ issuemobile: '', description: '' })
      setTimeout(() => {
        setShowPopup(false)
        setSupportMsg('')
      }, 800)
    } catch (err) {
      setSupportMsg(err.message || 'Error')
    }
  }

  const loginTitle = content.loginTitle || content.marquee || DEFAULT_TITLE
  const apkUrl = content.apkUrl || ''
  const apkUrl2 = content.apkUrl2 || content.apkUrl || ''

  return (
    <>
      <div className={`splash-screen ${loadingsplash ? 'visible' : 'hidden'}`}>
        <div className="logonew">
          <img src={logo} className="img-fluid" alt="RPK 90" />
        </div>
        <p className="trust">Trust And Seal rpk90 Club 100% Safe And Secure</p>
      </div>

      <div className="Loginpage">
        <div className="overlaybgcolor" />
        <div className="loginform position-relative">
          <div className="width_77">
            <h2>{loginTitle}</h2>
          </div>

          <div className="logobgshape d-flex justify-content-center align-items-center">
            <div className="logo">
              <img src={logo} width="150" alt="RPK 90" />
            </div>
          </div>

          <div className="bg-white login-form">
            <h3 className="mb-0 fw-bold text-center">Welcome Back</h3>
            <div className="form-login-design">
              {view === 'login' ? (
                <form onSubmit={onSubmit} autoComplete="off">
                  <div className="login-item">
                    <small>Moblie Number</small>
                    <div className="username">
                      <PersonIcon />
                      <input
                        className="username-input"
                        name="mobileNum"
                        maxLength={10}
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={onInputChange}
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="login-item">
                    <small>
                      MPIN <span style={{ color: 'red' }}>(ex.A12345)</span>
                    </small>
                    <div className="username">
                      <PersonIcon />
                      <input
                        className="username-input"
                        name="mpin"
                        maxLength={10}
                        placeholder="MPIN"
                        value={mpin}
                        onChange={handleChangeMpin}
                      />
                    </div>
                    <p style={{ color }}>
                      <b>{message}</b>
                    </p>
                    <span>
                      <a
                        href="/forget-mpin"
                        onClick={(event) => {
                          event.preventDefault()
                          setView('create')
                          setError('')
                          setMpin('')
                          setConfirmMpin('')
                          setMessage('')
                          setIsValidMpin(false)
                        }}
                      >
                        Create New MPIN
                      </a>
                    </span>
                  </div>

                  {error && <p className="login-error">{error}</p>}

                  {loading ? (
                    <div className="d-flex position-relative loginloader">
                      <span className="loaderfile">Please wait...</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className={`w-100 refer-button cxy send-otp btn sendotp text-white ${isValidMobile ? 'valid-button' : ''}`}
                      id="send_ottp"
                      disabled={!isValidMobile}
                    >
                      Login
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={onCreateMpin} autoComplete="off">
                  <div className="login-item">
                    <small>Moblie Number</small>
                    <div className="username">
                      <PersonIcon />
                      <input
                        className="username-input"
                        name="mobileNum"
                        maxLength={10}
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={onInputChange}
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="login-item">
                    <small>
                      New MPIN <span style={{ color: 'red' }}>(ex.A12345)</span>
                    </small>
                    <div className="username">
                      <PersonIcon />
                      <input
                        className="username-input"
                        name="mpin"
                        maxLength={10}
                        placeholder="Enter MPIN"
                        value={mpin}
                        onChange={handleChangeMpin}
                      />
                    </div>
                    <p style={{ color }}>
                      <b>{message}</b>
                    </p>
                  </div>

                  <div className="login-item">
                    <small>Confirm MPIN</small>
                    <div className="username">
                      <PersonIcon />
                      <input
                        className="username-input"
                        name="confirmMpin"
                        maxLength={10}
                        placeholder="Confirm MPIN"
                        value={confirmMpin}
                        onChange={(event) => setConfirmMpin(event.target.value)}
                      />
                    </div>
                  </div>

                  {error && <p className="login-error">{error}</p>}

                  {loading ? (
                    <div className="d-flex position-relative loginloader">
                      <span className="loaderfile">Please wait...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className={`w-100 refer-button cxy send-otp btn sendotp text-white ${isValidMobile ? 'valid-button' : ''}`}
                        disabled={!isValidMobile || !isValidMpin}
                      >
                        SEND OTP
                      </button>
                      <div className="d-flex justify-content-center">
                        <a
                          href="/"
                          className="mt-2 have-account"
                          onClick={(event) => {
                            event.preventDefault()
                            setView('login')
                            setError('')
                          }}
                        >
                          Have An Account? Login
                        </a>
                      </div>
                    </>
                  )}
                </form>
              )}

              {isIOS && (
                <div className="d-flex jusitfy-content-center">
                  <OffCanvasExample name="Install Web Application IOS" />
                </div>
              )}

              {!isIOS && showInstallButton && (
                <div className="install-wrap">
                  <button
                    type="button"
                    className="btn btn-ronded text-light pwabtn pwa_bbtn_color w-100"
                    onClick={handleInstallClick}
                  >
                    Install Application 1
                  </button>
                  <a
                    className="btn btn-ronded text-light pwabtn pwa_bbtn_color w-100"
                    target="_blank"
                    rel="noreferrer"
                    href={apkUrl2 || apkUrl || '#'}
                  >
                    Install Application 2
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="call-buton" onClick={() => setShowPopup(true)}>
            <img src={support} alt="supprt" />
          </div>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-box">
                <h2>Support Form</h2>
                <form onSubmit={handleSubmitIssue}>
                  <div className="form-group">
                    <label>Mobile</label>
                    <input
                      type="number"
                      name="issuemobile"
                      value={formData.issuemobile}
                      onChange={(event) => setFormData({ ...formData, issuemobile: event.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Issue</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                      rows="3"
                      required
                    />
                  </div>
                  {supportMsg && <p className="login-error">{supportMsg}</p>}
                  <div className="form-actions">
                    <button type="button" className="cancel btn w-100" onClick={() => setShowPopup(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-ronded text-light pwabtn pwa_bbtn_color w-100">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
