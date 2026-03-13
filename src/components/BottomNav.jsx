import { BarChart3, ClipboardList, Home, PlusCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const tabs = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/session', icon: PlusCircle, label: 'Séance' },
  { to: '/templates', icon: ClipboardList, label: 'Templates' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const TabIcon = tab.icon
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            <TabIcon size={20} />
            <span>{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
