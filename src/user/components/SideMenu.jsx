import logo from '../../assets/logo.png'
import swordIcon from '../../assets/sword.png'
import gameIcon from '../../assets/game.png'
import historyIcon from '../../assets/dl_history.png'
import connectionIcon from '../../assets/connection.png'
import rateIcon from '../../assets/rate.png'
import { useEffect, useState } from 'react'
import { listenContent } from '../../api/api'

const APK_URL = 'https://rpk90.com/apk/RPK90-V1.apk'
const SITE_URL = 'https://www.rpk90.com'

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="side-menu-icon-svg" fill="currentColor">
      <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z" />
      <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="side-menu-icon-svg" fill="currentColor">
      <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="side-menu-icon-svg" fill="currentColor">
      <path d="M6 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h6.5A1.5 1.5 0 0 0 14.5 11.5v-7A1.5 1.5 0 0 0 13 3H6z" />
      <path d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H9.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
    </svg>
  )
}

function MenuIcon({ type }) {
  if (type === 'phone') return <PhoneIcon />
  if (type === 'share') return <ShareIcon />
  if (type === 'logout') return <LogoutIcon />
  if (type === 'sword') return <img src={swordIcon} alt="" className="side-menu-icon-img" />
  if (type === 'game') return <img src={gameIcon} alt="" className="side-menu-icon-img" />
  if (type === 'history') return <img src={historyIcon} alt="" className="side-menu-icon-img" />
  if (type === 'connection') return <img src={connectionIcon} alt="" className="side-menu-icon-img" />
  if (type === 'rate') return <img src={rateIcon} alt="" className="side-menu-icon-img" />
  return null
}

const items = [
  { id: 'app-details', label: 'App Details', icon: 'phone' },
  {
    id: 'play-history',
    label: 'My Play History',
    hint: 'अपनी खेली हुई गेम देखने के लिए यहाँ दबाए।',
    icon: 'sword',
  },
  {
    id: 'game-posting',
    label: 'Game Posting',
    hint: 'गेम की पोस्टिंग देखने के लिए यहां दबाए।',
    icon: 'game',
    green: true,
  },
  {
    id: 'result-history',
    label: 'Result History',
    hint: 'गेम के रिजल्ट देखने के लिए यहाँ दबाए।',
    icon: 'history',
  },
  {
    id: 'terms',
    label: 'Terms And Condition',
    hint: 'नियम एवं शर्ते।',
    icon: 'connection',
  },
  {
    id: 'share',
    label: 'Share',
    hint: 'जो भाई गली दिसावर प्ले करते है व्हाट्सअप पर शेयर करे।',
    icon: 'share',
    green: true,
  },
  {
    id: 'rate',
    label: 'Rate Our App',
    hint: 'हमारी एप्लिकेशन को सुझाव देने के लिए दबाए।',
    icon: 'rate',
  },
  { id: 'logout', label: 'Logout', icon: 'logout' },
  { id: 'download-apk', label: 'Download APK', icon: 'rate' },
]

export default function SideMenu({ open, onClose, onNavigate, onLogout, userId }) {
  const [content, setContent] = useState({})
  const apkUrl = content.apkUrl || APK_URL
  const siteUrl = content.siteUrl || SITE_URL

  useEffect(() => listenContent(setContent), [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleShare() {
    const url = siteUrl
    if (navigator.share) {
      navigator.share({ title: 'RPK 90 Matka App', url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
    }
  }

  function handleItem(item) {
    if (item.id === 'logout') {
      onLogout()
      return
    }
    if (item.id === 'share') {
      handleShare()
      onClose()
      return
    }
    if (item.id === 'download-apk') {
      window.open(apkUrl, '_blank', 'noopener,noreferrer')
      onClose()
      return
    }
    onNavigate(item.id)
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside className={`side-menu ${open ? 'is-open' : ''}`}>
        <div className="side-menu-header">
          <div className="side-menu-blob side-menu-blob-1" />
          <div className="side-menu-blob side-menu-blob-2" />

          <button type="button" onClick={onClose} aria-label="Close" className="side-menu-close">
            ×
          </button>

          <div className="side-menu-top">
            <img src={logo} alt="RPK 90" className="side-menu-logo" />
            <button
              type="button"
              className="side-menu-edit"
              onClick={() => {
                onNavigate('edit-profile')
                onClose()
              }}
            >
              Edit Profile
            </button>
          </div>

          <p className="side-menu-id">ID : {userId}</p>
        </div>

        <div className="side-menu-list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItem(item)}
              className={`side-menu-item${item.green ? ' is-green' : ''}`}
            >
              <MenuIcon type={item.icon} />
              <span>
                <span className="side-menu-item-title">{item.label}</span>
                {item.hint && <span className="side-menu-item-hint">{item.hint}</span>}
              </span>
            </button>
          ))}

          <div className="side-menu-social">
            <div className="side-menu-social-row">
              <a href={siteUrl} target="_blank" rel="noreferrer">
                <span className="social-chat">Chat</span>
                <span>हमसे बात करने के लिए चैट पे क्लिक करे</span>
              </a>
              <a href={content.facebookUrl || 'https://facebook.com'} target="_blank" rel="noreferrer">
                <span className="social-fb">f</span>
                <span>सट्टा गेम के लिए हमारा फेसबुक ग्रुप ज्वाइन करे</span>
              </a>
              <a href={content.instagramUrl || 'https://instagram.com'} target="_blank" rel="noreferrer">
                <span className="social-ig">
                  <i className="bi bi-instagram" />
                </span>
                <span>इंस्टाग्राम पर फॉलो करे</span>
              </a>
            </div>
            <a href={siteUrl} target="_blank" rel="noreferrer" className="side-menu-site">
              www.rpk90.com
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}
