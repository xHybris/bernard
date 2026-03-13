import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useProfile } from './contexts/ProfileContext'
import { scheduleNotification } from './utils/notifications'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Session from './pages/Session'
import Settings from './pages/Settings'
import Stats from './pages/Stats'
import Templates from './pages/Templates'

function App() {
  const { profile } = useProfile()

  useEffect(() => {
    if (profile.onboardingCompleted && profile.notificationTime) {
      scheduleNotification(profile.notificationTime)
    }
  }, [profile.notificationTime, profile.onboardingCompleted])

  if (!profile.onboardingCompleted) {
    return <Onboarding />
  }

  return (
    <HashRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session" element={<Session />} />
          <Route path="/session/:sessionId/edit" element={<Session />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </HashRouter>
  )
}

export default App
