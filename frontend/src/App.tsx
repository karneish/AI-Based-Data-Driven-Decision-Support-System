import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import type { User } from './types'

type Page = 'landing' | 'login' | 'dashboard'

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (u: User) => { setUser(u); setPage('dashboard') }
  const handleLogout = () => { setUser(null); setPage('landing') }

  if (page === 'landing') return <LandingPage onGetStarted={() => setPage('login')} />
  if (page === 'login')   return <LoginPage onLogin={handleLogin} onBack={() => setPage('landing')} />
  if (page === 'dashboard' && user) return <Dashboard user={user} onLogout={handleLogout} />
  return null
}
