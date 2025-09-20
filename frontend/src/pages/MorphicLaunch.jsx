import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import './MorphicIDE.css'

export default function MorphicLaunch() {
  const phrases = [
    'The first universal workbench',
    'Shaped to you. Built for you. Adapting with you.',
    'Instant scaffolds. Embedded tests. Live evaluation.',
    'From idea → operation → artifact',
    'Democratising Innovation'
  ]
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 3600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="morphic-hero" style={{ minHeight: '100vh' }}>
      <div className="morphic-overlay" />
      <div className="morphic-center">
        <div key={idx} className="morphic-phrase fade-cycle">{phrases[idx]}</div>
        <NavLink to="/ide" className="morphic-cta" style={{ marginTop: '1.5rem' }}>Launch Workbench</NavLink>
      </div>
      <NavLink to="/morphic-ide" style={{ position:'absolute', left:16, top:16, background:'#fff', color:'#0b0e14', padding:'6px 10px', borderRadius:6, textDecoration:'none', fontWeight:700 }}>Back</NavLink>
    </div>
  )
}

