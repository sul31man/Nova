import React, { useState } from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Manifesto from './pages/Manifesto.jsx'
import Tasks from './pages/Tasks.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Education from './pages/Education.jsx'

export default function App() {
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false)

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
          <div style={dropdownStyle}>
            <button 
              style={{
                ...linkStyle({ isActive: window.location.pathname === '/' || window.location.pathname === '/manifesto' }),
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setHomeDropdownOpen(!homeDropdownOpen)}
              onBlur={() => setTimeout(() => setHomeDropdownOpen(false), 150)}
            >
              Home ▾
            </button>
            <div style={dropdownContentStyle}>
              <NavLink 
                to="/" 
                style={dropdownLinkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                Landing
              </NavLink>
              <NavLink 
                to="/manifesto" 
                style={dropdownLinkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                Manifesto
              </NavLink>
            </div>
          </div>
          <NavLink to="/tasks" style={linkStyle}>Tasks</NavLink>
          <NavLink to="/marketplace" style={linkStyle}>Marketplace</NavLink>
          <NavLink to="/education" style={linkStyle}>Education</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manifesto" element={<Manifesto />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/education" element={<Education />} />
        </Routes>
      </main>
    </div>
  )
}

