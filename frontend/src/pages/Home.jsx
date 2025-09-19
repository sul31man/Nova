import React, { useEffect, useState, useRef, useCallback } from 'react'
import './Home.css'

// AnimatedNetwork component - handles the canvas animation
const AnimatedNetwork = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const nodesRef = useRef([])
  const edgesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const frameTimeRef = useRef([])
  const nodeCountRef = useRef(900) // Default desktop node count

  // Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Initialize nodes and edges
  const initNetwork = useCallback((canvas) => {
    const { width, height } = canvas
    const isMobile = window.innerWidth < 768
    const isReducedMotion = prefersReducedMotion()
    
    // Adjust node count based on device and preferences
    let baseNodeCount = isMobile ? 450 : 900
    if (isReducedMotion) baseNodeCount = 300
    nodeCountRef.current = baseNodeCount

    const nodes = []
    const edges = []

    // Create nodes with random positions and velocities
    for (let i = 0; i < nodeCountRef.current; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5, // Slow drift
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      })
    }

    // Create edges between nearby nodes (approximate KNN)
    nodes.forEach((node, i) => {
      const distances = nodes
        .map((other, j) => ({
          index: j,
          distance: Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2)
        }))
        .filter(d => d.index !== i)
        .sort((a, b) => a.distance - b.distance)

      // Connect to 2-3 nearest neighbors
      const connections = Math.floor(Math.random() * 2) + 2
      for (let j = 0; j < Math.min(connections, distances.length); j++) {
        const target = distances[j].index
        if (distances[j].distance < 120) { // Only connect nearby nodes
          edges.push({
            from: i,
            to: target,
            opacity: Math.max(0, 0.25 - distances[j].distance / 500)
          })
        }
      }
    })

    nodesRef.current = nodes
    edgesRef.current = edges
  }, [prefersReducedMotion])

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const nodes = nodesRef.current
    const edges = edgesRef.current
    const mouse = mouseRef.current
    const isReducedMotion = prefersReducedMotion()

    // Track frame time for performance monitoring
    const frameStart = performance.now()

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Update and draw nodes
    nodes.forEach((node, i) => {
      // Update position with drift (reduce if reduced motion)
      if (!isReducedMotion) {
        node.x += node.vx
        node.y += node.vy

        // Subtle mouse parallax
        const mouseInfluence = 0.0001
        const dx = mouse.x - node.x
        const dy = mouse.y - node.y
        node.x += dx * mouseInfluence
        node.y += dy * mouseInfluence

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1
        
        // Keep in bounds
        node.x = Math.max(0, Math.min(width, node.x))
        node.y = Math.max(0, Math.min(height, node.y))
      }

      // Draw node
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0, 0, 0, ${node.opacity * 10})`
      ctx.fill()
    })

    // Draw edges
    if (!isReducedMotion) {
      edges.forEach(edge => {
        const from = nodes[edge.from]
        const to = nodes[edge.to]
        
        if (from && to) {
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)
          ctx.strokeStyle = `rgba(0, 0, 0, ${edge.opacity * 0.2})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })
    }

    // Performance monitoring - halve nodes if consistently slow
    const frameTime = performance.now() - frameStart
    frameTimeRef.current.push(frameTime)
    if (frameTimeRef.current.length > 60) {
      frameTimeRef.current.shift()
      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b) / frameTimeRef.current.length
      
      if (avgFrameTime > 24 && nodeCountRef.current > 100) {
        nodeCountRef.current = Math.floor(nodeCountRef.current / 2)
        initNetwork(canvas)
        frameTimeRef.current = []
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [initNetwork, prefersReducedMotion])

  // Handle canvas resize and DPR scaling
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    initNetwork(canvas)
  }, [initNetwork])

  // Mouse tracking for parallax
  const handleMouseMove = useCallback((e) => {
    mouseRef.current = {
      x: e.clientX,
      y: e.clientY
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initial setup
    handleResize()
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [animate, handleResize, handleMouseMove])

  return (
    <canvas
      ref={canvasRef}
      className="network-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  )
}

export default function Home() {
  const [apiMessage, setApiMessage] = useState('...')
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    fetch('/api/hello')
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.json()
      })
      .then((data) => setApiMessage(data.message))
      .catch((error) => setApiError(error.message))
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section with Animated Network */}
      <section className="hero">
        {/* Subtle math grid under the particle network */}
        <div className="math-grid" aria-hidden="true" />
        <AnimatedNetwork />
        <div className="legend" aria-hidden="true">
          <span className="chip">Σ productivity</span>
          <span className="chip">constraints</span>
          <span className="chip">credits</span>
        </div>
        <div className="hero-inner">
          <h1 className="hero-title">
            Scheduling the most successful compute cluster in history.
          </h1>
          
          <p className="hero-subtitle">
          STEM students waste years on assignments that don’t matter. Nova lets you do real missions, get paid instantly, and level up as an Operator Node in the cluster — always learning, always building, always employed.
          </p>

          {/* Mathematical “objective + constraints” strip */}
          <div className="equation" role="img" aria-label="maximise sum productivity subject to constraints">
            <span className="op">maximise</span>
            <span className="sym"> Σ</span>
            <span> productivity_i</span>
            <span className="constraint">
              s.t. <span className="brace">[</span>
              skills_match ≥ 1 • time ≤ deadline • credits conserved
              <span className="brace">]</span>
            </span>
          </div>
          
          <ul className="hero-features">
            <li>
              <strong>AI-guided tasks</strong> — challenges decomposed, people scaffolded.
            </li>
            <li>
              <strong>Learn-to-earn</strong> — skills on demand, mastery unlocked.
            </li>
            <li>
              <strong>Democratised engineering</strong> — humanity fixes its own problems.
            </li>
          </ul>
          
          <div className="api-status">
            <span className={`status-dot ${apiError ? 'offline' : 'online'}`}></span>
            System: {apiError ? 'Offline' : 'Online'}
          </div>
          
          <div className="hero-cta">
            <a href="/tasks" className="cta-primary">Join the Cluster</a>
            <a href="/manifesto" className="cta-secondary">See how it works</a>
          </div>
        </div>
      </section>

      {/* Image + Text Section (no animation) */}
      <section className="image-banner" role="region" aria-label="Showcase">
        <div className="image-banner__overlay" aria-hidden="true" />
        <div className="image-banner__content">
          <h2 className="image-banner__title">Turning People to Builders to Architects of the future</h2>
          <p className="image-banner__subtitle">
            Build Together
          </p>
          <p className="image-banner__subtitle">
            Build Quickly
          </p>
          <p className="image-banner__subtitle">
            Make a Mark
          </p>
          <p className="image-banner__subtitle">
            From Wherever
          </p>
          <p className="image-banner__subtitle">
            From Whoever
          </p>
          <p className="image-banner__subtitle">
            Empowering and Optimising Humanity
          </p>
        </div>
      </section>

      {/* Second Image + Text Section (no animation) */}
      <section className="image-banner image-banner--secondary" role="region" aria-label="Showcase 2">
        <div className="image-banner__overlay" aria-hidden="true" />
        <div className="image-banner__content image-banner__content--right">
          <h2 className="image-banner__title">Building Never Had to be Hard</h2>
          <p className="image-banner__subtitle">Giving you missions you can complete and be rewarded for quickly</p>
          <p className="image-banner__subtitle">Giving you the best path to become the 10x engineer you always could've been</p>
        </div>
      </section>
    
    <p><em>From people to builders, from builders to architects of civilisation.</em></p>
    <p>Nova 2025 - Suleiman Khan</p>
    </div>
    
  )
}
