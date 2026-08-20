import HelpPromoModal from './user/components/HelpPromoModal'
import LoginPage from './user/pages/LoginPage'
import UserApp from './user/UserApp'
import AdminApp from './admin/AdminApp'
import { useAuth } from './api/AuthContext.jsx'

export default function App() {
  const { user, profile, loading, isAdmin, logout } = useAuth()

  if (loading) {
    return (
      <div className="gold-page flex min-h-dvh items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <HelpPromoModal />
      </>
    )
  }

  if (isAdmin) {
    return <AdminApp mobile={profile?.mobile || user.mobile} onLogout={logout} />
  }

  return <UserApp />
}
