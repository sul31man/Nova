import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import './Join.css'

export default function Join() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(-1) // -1 opening quote
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bootIdx, setBootIdx] = useState(0)

  // Identity fields (we keep it simple; vibes over verbosity)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [interests, setInterests] = useState('')
  const [skills, setSkills] = useState('')
  const [oath, setOath] = useState(false)

  // Ritual hold-to-link
  const [holdProgress, setHoldProgress] = useState(0)
  const holdRafRef = useRef(null)
  const holdStartRef = useRef(0)

  const canvasRef = useRef(null)

  // Orb animation for step 2
  useEffect(() => {
    if (step !== 1) return
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    let raf
    const render = () => {
      const w = c.clientWidth
      const h = c.clientHeight
      const dpr = window.devicePixelRatio || 1
      if (c.width !== w * dpr || c.height !== h * dpr) {
        c.width = w * dpr
        c.height = h * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      ctx.clearRect(0,0,w,h)
      // subtle grid
      ctx.fillStyle = 'rgba(255,255,255,0.025)'
      for (let x=0; x<w; x+=24) ctx.fillRect(x, 0, 1, h)
      for (let y=0; y<h; y+=24) ctx.fillRect(0, y, w, 1)
      // orb properties
      const base = 36
      const size = Math.min(160, base + fullName.length * 6)
      const cx = w/2
      const cy = h/2
      // glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, size*1.6)
      grd.addColorStop(0, 'rgba(154, 230, 255, 0.30)')
      grd.addColorStop(1, 'rgba(154, 230, 255, 0)')
      ctx.fillStyle = grd
      ctx.beginPath(); ctx.arc(cx, cy, size*1.6, 0, Math.PI*2); ctx.fill()
      // core
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI*2); ctx.fill()
      // connections based on skills
      const tokens = skills.split(',').map(s=>s.trim()).filter(Boolean)
      const arms = Math.max(2, Math.min(8, tokens.length))
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      for (let i=0;i<arms;i++){
        const a = (i/arms)*Math.PI*2
        const r = size + 32 + (i%3)*14
        const x = cx + Math.cos(a)*r
        const y = cy + Math.sin(a)*r
        ctx.beginPath()
        ctx.moveTo(cx,cy)
        ctx.lineTo(x,y)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x,y,4,0,Math.PI*2)
        ctx.fillStyle='rgba(255,255,255,0.9)'
        ctx.fill()
      }
      // rotating glyph ring for ritual feel
      const t = performance.now()*0.002
      const ringR = size + 70
      for (let i=0; i<16; i++){
        const a = t*0.4 + (i/16)*Math.PI*2
        const x = cx + Math.cos(a)*ringR
        const y = cy + Math.sin(a)*ringR
        ctx.fillStyle = 'rgba(154,230,255,0.85)'
        ctx.beginPath(); ctx.arc(x,y,2.1,0,Math.PI*2); ctx.fill()
      }
      raf = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(raf)
  }, [step, fullName, skills])

  const nodeId = useMemo(() => {
    // Simple, pretty id placeholder
    const n = Math.floor(10000 + Math.random()*90000)
    return `N-${n}`
  }, [step])

  const genUsername = (name) => {
    const base = (name || 'operator').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,12) || 'operator'
    const suffix = Math.floor(100 + Math.random()*900)
    return `${base}${suffix}`
  }

  const handleActivate = () => setStep(1)

  // Boot lines for step 0 typewriter
  const bootLines = useMemo(()=>[
    'Initializing secure link…',
    'Calibrating operator interface…',
    'Spinning up cluster handshake…',
    'Entropy seeded. Awaiting activation.',
  ], [])

  useEffect(() => {
    if (step !== 0) return
    const t = setInterval(()=> setBootIdx(i => (i+1)%bootLines.length), 2600)
    return () => clearInterval(t)
  }, [step, bootLines])

  const handleRegister = async (e) => {
    e?.preventDefault()
    setError('')
    if (!fullName || !email || !password) {
      setError('Please complete name, email and passphrase')
      return
    }
    if (!oath) {
      setError('Please accept the Operator Oath to continue')
      return
    }
    setLoading(true)
    try {
      const username = genUsername(fullName)
      const res = await register(username, email, password, fullName)
      if (!res.success) throw new Error(res.error || 'Registration failed')
      setStep(2)
      // After activation, show closing quote then return home
      setTimeout(()=> setStep(4), 1600)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Ritual hold handlers
  const beginHold = () => {
    if (loading || !oath) return
    holdStartRef.current = performance.now()
    const dur = 1600
    const tick = () => {
      const p = Math.min(1, (performance.now() - holdStartRef.current)/dur)
      setHoldProgress(p)
      if (p >= 1) {
        cancelAnimationFrame(holdRafRef.current)
        setTimeout(()=>handleRegister(), 50)
        return
      }
      holdRafRef.current = requestAnimationFrame(tick)
    }
    holdRafRef.current = requestAnimationFrame(tick)
  }
  const endHold = () => {
    cancelAnimationFrame(holdRafRef.current)
    setHoldProgress(0)
  }

  const handleAcceptMission = () => {
    // Land them in Operations (tasks) for now
    navigate('/tasks')
  }

  // Opening quote then welcome
  useEffect(() => {
    if (step === -1) {
      const t = setTimeout(() => setStep(0), 2200)
      return () => clearTimeout(t)
    }
  }, [step])
  // Closing quote returns home
  useEffect(() => {
    if (step === 4) {
      const t = setTimeout(() => navigate('/'), 2200)
      return () => clearTimeout(t)
    }
  }, [step, navigate])

  return (
    <div className="join-root">
      <NavLink to="/" className="join-home">Home</NavLink>
      {step === -1 && (
        <section className="join-screen center">
          <div className={`quote-screen fade-seq`} onClick={()=>setStep(0)}>
            <p className="quote">“From people to builders. From builders to architects of civilisation”</p>
          </div>
        </section>
      )}
      {step === 0 && (
        <section className="join-screen">
          <div className="bg-network" aria-hidden="true" />
          <div className="join-inner">
            <h1 className="join-title">Welcome, Operator.</h1>
            <p className="join-sub">You are about to activate your node in the Nova Cluster.</p>
            <p className="typewriter">Initialising secure link… establishing quantum handshake…</p>
            <button className="join-cta" onClick={handleActivate}>ACTIVATE NODE</button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="join-screen">
          <div className="bg-network" aria-hidden="true" />
          <div className="identity">
            <div className="orb-wrap"><canvas ref={canvasRef} className="orb" /></div>
            <form className="identity-form" onSubmit={handleRegister}>
              <div className="row">
                <label>Access Name</label>
                <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="e.g., Ada Lovelace" />
              </div>
              <div className="row two">
                <div>
                  <label>Operator Email</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.com" />
                </div>
                <div>
                  <label>Passphrase</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
                </div>
              </div>
              <div className="row">
                <label>Interests</label>
                <input value={interests} onChange={e=>setInterests(e.target.value)} placeholder="AI, hardware, systems" />
              </div>
              <div className="row">
                <label>Skills</label>
                <input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Python, React, CAD" />
              </div>
              <div className="oath">
                <div className="oath-lines">
                  <div>“I build with care.</div>
                  <div>I learn with humility.</div>
                  <div>I strengthen the Cluster.”</div>
                </div>
                <label className="oath-accept">
                  <input type="checkbox" checked={oath} onChange={e=>setOath(e.target.checked)} />
                  <span>I accept the Operator Oath</span>
                </label>
              </div>
              {error && <div className="join-error">{error}</div>}
              <button
                type="button"
                className={`hold-btn ${oath ? '' : 'disabled'}`}
                onMouseDown={beginHold}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onTouchStart={beginHold}
                onTouchEnd={endHold}
                aria-disabled={!oath}
              >
                <svg className="ring" width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="21" className="track" />
                  <circle cx="24" cy="24" r="21" className="progress" style={{ strokeDashoffset: `${132 - 132*holdProgress}` }} />
                </svg>
                <span>{loading ? 'LINKING…' : (oath ? 'HOLD TO LINK' : 'ACCEPT OATH TO LINK')}</span>
              </button>
            </form>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="join-screen center">
          <div className="pulse" />
          <div className="activated">
            <div className="sigil" aria-hidden="true">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="42" stroke="#000" strokeWidth="2" fill="none" />
                {[...Array(8)].map((_,i)=> {
                  const a = (i/8)*Math.PI*2
                  const x = 60 + Math.cos(a)*36
                  const y = 60 + Math.sin(a)*36
                  return <line key={i} x1="60" y1="60" x2={x} y2={y} stroke="#000" strokeWidth="2" />
                })}
                <circle cx="60" cy="60" r="4" fill="#000" />
              </svg>
            </div>
            <h2>Node Activated.</h2>
            <div className="node-id">{nodeId}</div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="join-screen center">
          <div className="mission">
            <h3>Awaiting your first mission…</h3>
            <div className="card">
              <div className="card-title">Warm-up: Link Your First Operation</div>
              <p className="card-body">Explore Operations and claim a beginner-friendly issue to contribute to the Cluster.</p>
              <button className="join-cta small" onClick={handleAcceptMission}>ACCEPT MISSION</button>
            </div>
            <button className="ghost" onClick={()=>setStep(4)}>Skip for now</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="join-screen center">
          <div className="quote-screen" onClick={()=>navigate('/') }>
            <p className="quote">“From people to builders. From builders to architects of civilisation”</p>
          </div>
        </section>
      )}
    </div>
  )
}
