import { useEffect, useMemo, useRef, useState } from 'react'
import logo from '../../assets/logo.png'
import MoneyBag from '../components/MoneyBag'
import { listenContent, listenMarkets, loadResultsForDates, withResults } from '../../api/api'

function pad(value) {
  return String(value).padStart(2, '0')
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatClock(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let hours = date.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${days[date.getDay()]} ${pad(hours)}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${ampm}`
}

function formatDate(date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}

export default function HomePage({ onOpenChat }) {
  const [now, setNow] = useState(() => new Date())
  const [markets, setMarkets] = useState([])
  const [results, setResults] = useState({ today: {}, previous: {} })
  const [content, setContent] = useState({})
  const resultsRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => listenContent(setContent), [])
  useEffect(() => listenMarkets(setMarkets), [])

  useEffect(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    loadResultsForDates(dateKey(today), dateKey(yesterday)).then(setResults).catch(() => {})
  }, [now.getMinutes()])

  const rows = useMemo(() => withResults(markets, results), [markets, results])
  const featured = useMemo(() => {
    const declared = rows.filter((market) => market.today !== 'XX')
    return declared[declared.length - 1] || rows[0]
  }, [rows])
  const marquee = content.marquee || '🔥 भरोसे का एक ही नाम 🔥 बाबा जी खाईवाल 🙏'
  const flashLines = (content.flashMessage || '🔥 ALL IS WELL 🔥\n🙏 GOD IS GREAT 🙏').split('\n').filter(Boolean)
  const resultLink = content.resultLink || content.bannerLink

  return (
    <div className="bg-[#eef3f8] pb-4">
      <section className="home-toolbar">
        <div className="home-toolbar-chats">
          <button
            type="button"
            onClick={() => onOpenChat('deposit')}
            className="home-toolbar-btn home-toolbar-btn-dark"
          >
            <i className="bi bi-chat-dots" />
            Deposit Chat
          </button>
          <button
            type="button"
            onClick={() => onOpenChat('withdraw')}
            className="home-toolbar-btn home-toolbar-btn-gold"
          >
            <i className="bi bi-chat-dots" />
            Withdraw Chat
          </button>
        </div>

        <div className="home-toolbar-logo">
          <img src={logo} alt="RPK 90" />
        </div>

        <div className="home-toolbar-actions">
          <button
            type="button"
            onClick={() => {
              const url = content.otherGameUrl || content.siteUrl
              if (url) window.open(url, '_blank', 'noopener,noreferrer')
            }}
            className="home-toolbar-btn home-toolbar-btn-other"
          >
            Other Game
            <span className="home-toolbar-new">NEW</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date()
              const yesterday = new Date(today)
              yesterday.setDate(today.getDate() - 1)
              loadResultsForDates(dateKey(today), dateKey(yesterday)).then(setResults).catch(() => {})
              setNow(new Date())
            }}
            className="home-toolbar-btn home-toolbar-btn-refresh"
          >
            Refresh
          </button>
        </div>
      </section>

      <div className="home-marquee">
        <div className="home-marquee-track">
          {[0, 1, 2, 3].map((index) => (
            <span key={index}>
              {content.bannerLink ? (
                <a href={content.bannerLink} target="_blank" rel="noreferrer">{marquee}</a>
              ) : marquee}
            </span>
          ))}
        </div>
      </div>

      <div className="home-flash">
        {flashLines.map((line) => <p key={line}>{line}</p>)}
        <p className="mt-0.5 font-semibold">{formatClock(now)}</p>
      </div>

      {featured ? (
        <div className="home-featured">
          <MoneyBag />
          <div className="min-w-0 text-center">
            <p className="home-featured-title">Result</p>
            <p className="home-featured-name">{featured.today === 'XX' ? 'Not Available' : featured.name}</p>
            <p className="home-featured-value">{featured.today === 'XX' ? 'Result Not Available' : featured.today}</p>
          </div>
          <MoneyBag />
        </div>
      ) : (
        <div className="home-featured">
          <MoneyBag />
          <div className="min-w-0 text-center">
            <p className="home-featured-title">Result</p>
            <p className="home-featured-name">Not Available</p>
            <p className="home-featured-value">Result Not Available</p>
          </div>
          <MoneyBag />
        </div>
      )}

      <p className="home-click-hint">🔥 सबसे पहले रिजल्ट देखने के लिए क्लिक करे 🔥</p>
      <div className="mb-3 flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (resultLink) {
              window.open(resultLink, '_blank', 'noopener,noreferrer')
              return
            }
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="home-click-link"
        >
          Click Link
        </button>
      </div>

      <div ref={resultsRef} className="live-note">
        <h3>Note</h3>
        <p>{content.liveNote || '👍👍 इस एप्लीकेशन में 950 का रेट कर दिया गया है 🙏 JAI BABA KI 🙏'}</p>
      </div>

      <div className="live-title">rpk90 Matka Live Result of {formatDate(now)}</div>
      <div className="live-head">
        <span className="live-head-tab">Market Name/Time</span>
        <div className="live-head-results">
          <span>Previous Result</span>
          <span>Today Result</span>
        </div>
      </div>

      {rows.map((market) => (
        <div key={market.id || market.name} className="market-row">
          <p className="market-name">{market.name}</p>
          <div className="market-body">
            <div className="market-times">
              <div>
                <p className="market-label">Open Time</p>
                <p className="market-time">{market.open}</p>
              </div>
              <div className="market-split" />
              <div>
                <p className="market-label">Close Time</p>
                <p className="market-time">{market.close}</p>
              </div>
              <div className="market-split" />
              <div>
                <p className="market-label">Result At</p>
                <p className="market-time">{market.resultAt}</p>
              </div>
            </div>
            <div className="market-nums">
              <span>{market.previous}</span>
              <span>{market.today}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
