import React, { useState } from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Home from './pages/Home.jsx'
import Manifesto from './pages/Manifesto.jsx'
import Tasks from './pages/Tasks.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Education from './pages/Education.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import MyTasks from './pages/MyTasks.jsx'
import Workspace from './pages/Workspace.jsx'
import AuthModal from './components/AuthModal.jsx'
import UserProfile from './components/UserProfile.jsx'

const AppContent = () => {
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
    display: 'inline-block'
  }

  const dropdownContentStyle = {
    display: homeDropdownOpen ? 'block' : 'none',
    position: 'absolute',
    backgroundColor: 'white',
    minWidth: '160px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 1,
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

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif', padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <div style={{ fontFamily: 'JetBrains Mono, Space Mono, Courier New, monospace', fontWeight: 600, fontSize: '1.5rem', color: '#000', letterSpacing: '2px' }}>NOVA</div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <div style={dropdownStyle} data-dropdown>
            <button 
              style={{
                ...linkStyle({ isActive: window.location.pathname === '/' || window.location.pathname === '/manifesto' }),
                background: 'none',
                border: 'none',
                cursor: 'pointer'
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
            </div>
          </div>
          <NavLink to="/my-tasks" style={linkStyle}>Execute</NavLink>
          <NavLink to="/tasks" style={linkStyle}>Tasks</NavLink>
          <NavLink to="/marketplace" style={linkStyle}>Marketplace</NavLink>
          <NavLink to="/education" style={linkStyle}>Education</NavLink>
          
          {/* Authentication Section */}
          <div style={{ marginLeft: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <button 
                  onClick={() => openAuthModal('register')}
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
                  onMouseEnter={(e) => {
                    e.target.style.background = 'white'
                    e.target.style.color = '#000'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#000'
                    e.target.style.color = 'white'
                  }}
                >
                  Join Nova
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manifesto" element={<Manifesto />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/education" element={<Education />} />
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
