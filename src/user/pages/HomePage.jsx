import { useEffect, useMemo, useState } from 'react'
import logo from '../../assets/logo.png'
import MoneyBag from '../components/MoneyBag'
import { isMarketTimedOut, listenContent, listenMarkets, loadResultsForDates, withResults } from '../../api/api'

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

function MarketRow({ market, onPlay }) {
  const open = !isMarketTimedOut(market)
  function handleClick() {
    if (open) onPlay?.(market)
  }

  return (
    <div className="market" onClick={handleClick} role={open ? 'button' : undefined}>
      <div className="d-flex justify-content-between align-items-end">
        <div className="marketnamelist" style={{ width: '70%' }}>
          <h3 className="animationtittle markettitlename">{market.name}</h3>
          <ul className="liststyle">
            <li>
              Open Time
              <span className="d-block">{market.open}</span>
            </li>
            <li>|</li>
            <li>
              Close Time
              <span className="d-block">{market.close}</span>
            </li>
            <li>|</li>
            <li>
              Result At
              <span className="d-block">{market.resultAt}</span>
            </li>
          </ul>
        </div>
        <div className="d-flex">
          <div className="text-center">
            <h3 className="mb-0 text-white">{market.previous}</h3>
          </div>
          &nbsp; &nbsp; &nbsp;
          <div className="text-center">
            <h3 className="mb-0 text-white">{market.today}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage({ onOpenChat, onPlay }) {
  const [now, setNow] = useState(() => new Date())
  const [markets, setMarkets] = useState([])
  const [results, setResults] = useState({ today: {}, previous: {} })
  const [content, setContent] = useState({})

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
    const declared = rows.filter((market) => market.today && market.today !== 'XX')
    return declared[declared.length - 1] || rows[0]
  }, [rows])

  const marquee = content.marquee || '🔥 भरोसे का एक ही नाम 🔥 बाबा जी खाईवाल 🙏'
  const flashLines = (content.flashMessage || '🔥 ALL IS WELL 🔥\n🙏 GOD IS GREAT 🙏').split('\n').filter(Boolean)
  const loginHome = content.liveNote || '👍👍 इस एप्लीकेशन में 950 का रेट कर दिया गया है 🙏 JAI BABA KI 🙏'
  const resultLink = content.resultLink || content.bannerLink || 'https://satta-king-fixed-no.in'
  const otherGameUrl = content.otherGameUrl || content.siteUrl || ''

  function refreshPage() {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    loadResultsForDates(dateKey(today), dateKey(yesterday)).then(setResults).catch(() => {})
    setNow(new Date())
  }

  return (
    <div className="mainhome">
      <div className="bg_home">
        <div className="container-fluid">
          <div className="home-top-row">
            <div className="home-top-chats">
              <div className="button_chat">
                <button type="button" onClick={() => onOpenChat?.('deposit')}>
                  <div>
                    <i className="bi bi-chat-dots" />
                  </div>
                  Deposit Chat
                </button>
              </div>
              <div className="withdrawbutton_chat">
                <button type="button" onClick={() => onOpenChat?.('withdraw')}>
                  <div>
                    <i className="bi bi-chat-dots" />
                  </div>
                  Withdraw Chat
                </button>
              </div>
            </div>

            <div className="logofront">
              <img src={logo} className="mx-auto d-flex justify-content-end" alt="RPK 90" />
            </div>

            <div className="home-top-actions">
              <div className="othergames position-relative">
                <a
                  href={otherGameUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="position-relative"
                  onClick={(event) => {
                    if (!otherGameUrl) event.preventDefault()
                  }}
                >
                  Other Game
                  <span className="new-badge">NEW</span>
                </a>
              </div>
              <div className="cleardata">
                <a
                  href="#refresh"
                  onClick={(event) => {
                    event.preventDefault()
                    refreshPage()
                  }}
                >
                  Refresh
                </a>
              </div>
            </div>
          </div>
        </div>

        <marquee className="resultmarquee" behavior="" direction="">
          {content.bannerLink ? (
            <a href={content.bannerLink} target="_blank" rel="noreferrer">
              {marquee}
            </a>
          ) : (
            marquee
          )}
        </marquee>

        <div className="card card-style cardbabaji">
          <div className="content ">
            <center>
              {flashLines.map((line) => (
                <h6 key={line}>{line}</h6>
              ))}
            </center>
            <h6 className="d-flex justify-content-center">
              <span id="date">{formatClock(now)}</span>
            </h6>
          </div>
        </div>

        <div className="result-card">
          <div className="result align-items-center">
            <div className="result-bag-wrap">
              <MoneyBag />
            </div>
            <h6>
              <p className="text-danger fs-4 mb-2">Result</p>
              <p className="fw-bold mb-1">
                {featured?.today && featured.today !== 'XX' ? featured.name : 'Not Available'}
              </p>
              <span className="fw-bold">
                {featured?.today && featured.today !== 'XX' ? featured.today : 'Result Not Available'}
              </span>
            </h6>
            <div className="result-bag-wrap">
              <MoneyBag />
            </div>
          </div>
        </div>

        <div className="card text-center clickresult">
          <p className="mb-0">🔥 सबसे पहले रिजल्ट देखने के लिए क्लिक करे 🔥</p>
          <a
            href={resultLink}
            className="clicklink clicknewlink"
            id="neonShadow"
            target="_blank"
            rel="noreferrer"
          >
            Click Link
          </a>
        </div>

        <div className="card live-result">
          <p className="note-title">Note</p>
          <p>{loginHome}</p>
        </div>

        <div className="card matkalive-result">
          <p>rpk90 Matka Live Result of {formatDate(now)}</p>
        </div>

        <div className="live-head">
          <span className="live-head-tab">Market Name/Time</span>
          <div className="live-head-results">
            <span>Previous Result</span>
            <span>Today Result</span>
          </div>
        </div>

        {rows.map((market) => (
          <MarketRow key={market.id || market.name} market={market} onPlay={onPlay} />
        ))}
      </div>
    </div>
  )
}
