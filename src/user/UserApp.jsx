import { useEffect, useState } from 'react'
import HelpPromoModal from './components/HelpPromoModal'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import NotificationPage from './pages/NotificationPage'
import AppDetailsPage from './pages/AppDetailsPage'
import PlayHistoryPage from './pages/PlayHistoryPage'
import GamePostingPage from './pages/GamePostingPage'
import ResultHistoryPage from './pages/ResultHistoryPage'
import TermsPage from './pages/TermsPage'
import PlayPage from './pages/PlayPage'
import GamePlayPage from './pages/GamePlayPage'
import WalletPage from './pages/WalletPage'
import ChatPage from './pages/ChatPage'
import HelpPage from './pages/HelpPage'
import PlaceholderPage from './pages/PlaceholderPage'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import SideMenu from './components/SideMenu'
import { useAuth } from '../api/AuthContext.jsx'
import { listenNotifications } from '../api/api'

const titles = {
  home: 'Home',
  play: 'Play',
  wallet: 'wallet',
  help: 'Help',
  'edit-profile': 'Profile',
  'app-details': 'Appdetails',
  'play-history': 'History',
  'game-posting': 'Game Posting',
  'result-history': 'Resulthistory',
  terms: 'Termsandcondition',
  rate: 'Rate Our App',
  notifications: 'Notification',
}

export default function UserApp() {
  const { user, profile, logout } = useAuth()
  const [tab, setTab] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [chatKind, setChatKind] = useState('deposit')
  const [historyView, setHistoryView] = useState('pending')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.uid) return undefined
    return listenNotifications(user.uid, (items) => {
      setUnreadCount(items.filter((item) => !item.read).length)
    })
  }, [user?.uid])

  if (profile?.blocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef3f8] p-6 text-center">
        <p className="text-lg font-medium">This account is blocked.</p>
        <button type="button" className="mt-4 rounded bg-[#d7b54a] px-4 py-2 text-white" onClick={logout}>
          Logout
        </button>
      </div>
    )
  }

  const userId = profile?.mobile || user.email || ''
  const hideChrome = tab === 'game-posting' || tab === 'game-play' || tab === 'chat'

  return (
    <div className="min-h-screen bg-[#eef3f8]">
      {!hideChrome && (
        <Header
          title={
            tab === 'play-history'
              ? historyView === 'declared'
                ? 'History-declared'
                : 'History'
              : titles[tab] || 'Home'
          }
          points={profile?.balance || 0}
          unreadCount={unreadCount}
          onMenu={() => setMenuOpen(true)}
          onBell={() => setTab('notifications')}
        />
      )}

      {tab === 'game-posting' ? (
        <GamePostingPage onBack={() => setTab('home')} />
      ) : tab === 'game-play' && selectedMarket ? (
        <GamePlayPage market={selectedMarket} pointsRemaining={profile?.balance || 0} onBack={() => setTab('play')} />
      ) : tab === 'chat' ? (
        <ChatPage kind={chatKind} onBack={() => setTab('home')} />
      ) : (
        <main className="pb-24">
          {tab === 'home' && (
            <HomePage
              onOpenChat={(kind) => {
                setChatKind(kind || 'deposit')
                setTab('chat')
              }}
            />
          )}
          {tab === 'play' && (
            <PlayPage
              onPlay={(market) => {
                setSelectedMarket(market)
                setTab('game-play')
              }}
            />
          )}
          {tab === 'wallet' && <WalletPage />}
          {tab === 'help' && <HelpPage />}
          {tab === 'edit-profile' && <ProfilePage />}
          {tab === 'notifications' && <NotificationPage />}
          {tab === 'app-details' && <AppDetailsPage />}
          {tab === 'play-history' && <PlayHistoryPage onViewChange={setHistoryView} />}
          {tab === 'result-history' && <ResultHistoryPage />}
          {tab === 'terms' && <TermsPage />}
          {tab === 'rate' && <HelpPage />}
          {tab !== 'home' &&
            tab !== 'play' &&
            tab !== 'wallet' &&
            tab !== 'help' &&
            tab !== 'edit-profile' &&
            tab !== 'notifications' &&
            tab !== 'app-details' &&
            tab !== 'play-history' &&
            tab !== 'result-history' &&
            tab !== 'terms' &&
            tab !== 'rate' && <PlaceholderPage title={titles[tab] || tab} />}
        </main>
      )}

      {!hideChrome && <BottomNav tab={tab} onChange={setTab} />}
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(next) => {
          if (next === 'play-history') setHistoryView('pending')
          setTab(next)
        }}
        userId={userId}
        onLogout={() => {
          setMenuOpen(false)
          logout()
        }}
      />
      <HelpPromoModal
        onChat={() => {
          setChatKind('deposit')
          setTab('chat')
        }}
        onHelp={() => setTab('help')}
      />
    </div>
  )
}
