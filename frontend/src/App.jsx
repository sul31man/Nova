import React, { useState } from 'react'
import { NavLink, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Home from './pages/Home.jsx'
import Manifesto from './pages/Manifesto.jsx'
import MorphicIDE from './pages/MorphicIDE.jsx'
import Rewards from './pages/Rewards.jsx'
import Tasks from './pages/Tasks.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Education from './pages/Education.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import MyTasks from './pages/MyTasks.jsx'
import Workspace from './pages/Workspace.jsx'
import PhaseOne from './pages/PhaseOne.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Cluster from './pages/Cluster.jsx'
import Join from './pages/Join.jsx'
import Achievements from './pages/Achievements.jsx'
import LearningPath from './pages/LearningPath.jsx'
import IDEStandalone from './pages/IDEStandalone.jsx'
import MorphicLaunch from './pages/MorphicLaunch.jsx'
import AuthModal from './components/AuthModal.jsx'
import UserProfile from './components/UserProfile.jsx'
import logo from './my_images/logo.png'

const AppContent = () => {
  const location = useLocation()
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const { user, loading } = useAuth()
  
  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-dropdown]')) {
        setHomeDropdownOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        Loading Nova...
      </div>
    )
  }

  const linkStyle = ({ isActive }) => ({
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    color: isActive ? '#000' : '#666',
    fontFamily: 'JetBrains Mono, Space Mono, Courier New, monospace',
    fontSize: '0.9rem',
    fontWeight: isActive ? '600' : '400',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: isActive ? '2px solid #000' : '2px solid transparent',
    transition: 'all 0.2s ease'
  })

  const dropdownStyle = {
    position: 'relative',
    display: 'inline-block',
    zIndex: 1000
  }

  const dropdownContentStyle = {
    display: homeDropdownOpen ? 'block' : 'none',
    position: 'absolute',
    backgroundColor: 'white',
    minWidth: '200px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 2000,
    top: '100%',
    right: 0,
    border: '1px solid #eee'
  }

  const dropdownLinkStyle = {
    color: '#666',
    padding: '12px 16px',
    textDecoration: 'none',
    display: 'block',
    fontFamily: 'JetBrains Mono, Space Mono, Courier New, monospace',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.2s ease'
  }

  const isHome = location.pathname === '/'
  const isJoin = location.pathname === '/join'
  const isMorphicLaunch = location.pathname.startsWith('/morphic-ide/launch')

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif', padding: (isJoin || isMorphicLaunch) ? 0 : '2rem', maxWidth: (isJoin || isMorphicLaunch) ? 'none' : 960, margin: (isJoin || isMorphicLaunch) ? 0 : '0 auto' }}>
      {!(isJoin || isMorphicLaunch) && (
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', paddingTop: '0.5rem', lineHeight: 1, marginTop: isHome ? '0.75rem' : 0, position: 'relative', zIndex: 3000 }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', lineHeight: 1, paddingTop: '1px' }}>
          <img src={logo} alt="Nova logo" style={{ height: 26, width: 26, objectFit: 'contain', display: 'block' }} />
          <span style={{ fontFamily: 'JetBrains Mono, Space Mono, Courier New, monospace', fontWeight: 700, fontSize: '1.05rem', color: '#000', letterSpacing: '0.5px', lineHeight: 1, position: 'relative', top: '-1px' }}>Nova</span>
        </NavLink>
        <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', lineHeight: 3 }}>
          <div style={dropdownStyle} data-dropdown>
            <button 
              style={{
                ...linkStyle({ isActive: window.location.pathname === '/' || window.location.pathname === '/manifesto' }),
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1
              }}
              onClick={() => setHomeDropdownOpen(!homeDropdownOpen)}
            >
              Home ▾
            </button>
            <div style={dropdownContentStyle}>
              <NavLink 
                to="/" 
                style={dropdownLinkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                onClick={() => setHomeDropdownOpen(false)}
              >
                Landing
              </NavLink>
              <NavLink 
                to="/manifesto" 
                style={dropdownLinkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                onClick={() => setHomeDropdownOpen(false)}
              >
                Manifesto
              </NavLink>
              <NavLink 
                to="/rewards" 
                style={dropdownLinkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                onClick={() => setHomeDropdownOpen(false)}
              >
                Rewards
              </NavLink>
              <NavLink 
                to="/morphic-ide" 
                style={dropdownLinkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                onClick={() => setHomeDropdownOpen(false)}
              >
                The Morphic IDE
              </NavLink>
              <NavLink 
                to="/phase-one" 
                style={dropdownLinkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                onClick={() => setHomeDropdownOpen(false)}
              >
                Phase 1
              </NavLink>
            </div>
          </div>
          <NavLink to="/my-tasks" style={linkStyle}>Execute</NavLink>
          <NavLink to="/tasks" style={linkStyle}>Operations</NavLink>
          <NavLink to="/marketplace" style={linkStyle}>Marketplace</NavLink>
          <NavLink to="/morphic-ide" style={linkStyle}>The Morphic Ide</NavLink>
          <NavLink to="/leaderboard" style={linkStyle}>Leaderboard</NavLink>
          <NavLink to="/cluster" style={linkStyle}>Cluster</NavLink>
          <NavLink to="/achievements" style={linkStyle}>Achievements</NavLink>
          
          {/* Authentication Section */}
          <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', lineHeight: 1 }}>
            {user ? (
              <UserProfile />
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal('login')}
                  style={{
                    background: 'none',
                    border: '2px solid #000',
                    padding: '0.5rem 1rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    color: '#000',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#000'
                    e.target.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none'
                    e.target.style.color = '#000'
                  }}
                >
                  Sign In
                </button>
                <NavLink 
                  to="/join"
                  style={{
                    background: '#000',
                    border: '2px solid #000',
                    padding: '0.5rem 1rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px'
                  }}
                >
                  Join Nova
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manifesto" element={<Manifesto />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/morphic-ide" element={<MorphicIDE />} />
          <Route path="/morphic-ide/launch" element={<MorphicLaunch />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/education" element={<Education />} />
          <Route path="/phase-one" element={<PhaseOne />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/cluster" element={<Cluster />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/ide" element={<IDEStandalone />} />
          <Route path="/join" element={<Join />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/workspace/:taskId" element={<Workspace />} />
        </Routes>
      </main>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
