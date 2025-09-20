import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import './MorphicIDE.css'
import bgImage from '../my_images/image4.png'

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
    <div
      className="morphic-hero"
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0A0A0A'
      }}
    >
      <div className="morphic-overlay" />
      <div 
        className="morphic-noise-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(154,230,255,0.04), transparent 50%),
            radial-gradient(ellipse at 40% 40%, rgba(154,230,255,0.03), transparent 50%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")
          `,
          pointerEvents: 'none'
        }}
      />
      <div className="morphic-center">
        <div key={idx} className="morphic-phrase fade-cycle" style={{ marginLeft: '-4.5rem' }}>{phrases[idx]}</div>
      </div>
      <div style={{ 
        position: 'absolute', 
        bottom: '33vh', 
        left: '48.2%', 
        transform: 'translateX(-50%)',
        color: '#999',
        fontSize: '1.5rem',
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '1px',
        fontStyle: 'italic'
      }}>
        under construction
      </div>
      <NavLink to="/morphic-ide" style={{ position:'absolute', left:16, top:16, background:'#fff', color:'#0b0e14', padding:'6px 10px', borderRadius:6, textDecoration:'none', fontWeight:700 }}>Back</NavLink>
    </div>
  )
}
