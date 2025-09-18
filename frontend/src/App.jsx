import React from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Tasks from './pages/Tasks.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Education from './pages/Education.jsx'

export default function App() {
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

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif', padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <div style={{ fontFamily: 'JetBrains Mono, Space Mono, Courier New, monospace', fontWeight: 600, fontSize: '1.5rem', color: '#000', letterSpacing: '2px' }}>NOVA</div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <NavLink to="/" style={linkStyle} end>Home</NavLink>
          <NavLink to="/tasks" style={linkStyle}>Tasks</NavLink>
          <NavLink to="/marketplace" style={linkStyle}>Marketplace</NavLink>
          <NavLink to="/education" style={linkStyle}>Education</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/education" element={<Education />} />
        </Routes>
      </main>
    </div>
  )
}

