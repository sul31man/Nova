import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Full-screen interactive galaxy: stars (users) + planets (achievements)
export default function Cluster() {
  const { user } = useAuth()
  const mountRef = useRef(null)
  const animationRef = useRef(0)
  const galaxyRef = useRef({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const bootstrapThree = async (leaderboard = []) => {
    try {
      const THREE = await import('https://unpkg.com/three@0.159.0/build/three.module.js')
      const { OrbitControls } = await import('https://unpkg.com/three@0.159.0/examples/jsm/controls/OrbitControls.js')

      const container = mountRef.current
      const width = window.innerWidth
      const height = window.innerHeight

      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x0b0e14, 0.002)

      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000)
      camera.position.set(0, 40, 140)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.minDistance = 30
      controls.maxDistance = 800

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.35))
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.4)
      keyLight.position.set(50, 80, 20)
      scene.add(keyLight)

      // Galaxy background: spiral arms as a Points cloud
      const starGeo = new THREE.BufferGeometry()
      const N = 6000
      const positions = new Float32Array(N * 3)
      const colors = new Float32Array(N * 3)
      const color = new THREE.Color()
      const arms = 4
      const radius = 700
      for (let i = 0; i < N; i++) {
        const arm = i % arms
        const r = Math.pow(Math.random(), 0.5) * radius
        const angle = (arm / arms) * Math.PI * 2 + r * 0.0025 + (Math.random() - 0.5) * 0.35
        const x = Math.cos(angle) * r + (Math.random() - 0.5) * 15
        const y = (Math.random() - 0.5) * 10
        const z = Math.sin(angle) * r + (Math.random() - 0.5) * 15
        positions[i * 3] = x
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = z
        const t = r / radius
        color.setHSL(0.6 - t * 0.2, 0.6, 0.6 + (1 - t) * 0.2)
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const starMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })
      const galaxy = new THREE.Points(starGeo, starMat)
      scene.add(galaxy)

      // User stars as spheres with emissive glow and planet systems
      const systems = new THREE.Group()
      scene.add(systems)

      const importance = (u) => {
        const missions = Number(u.missions_completed || 0)
        const squads = Number(u.squads_led || 0)
        const credits = Number(u.credits || 0)
        const status = (u.status || '').toLowerCase()
        const statusBonus = status.includes('grand architect') ? 40 : status.includes('architect') ? 20 : 0
        return missions * 4 + squads * 6 + credits / 40 + statusBonus + 5
      }

      const createSystem = (label, importanceScore, colorHex = 0xffffff, center = new THREE.Vector3()) => {
        const size = Math.min(3.2, 1 + Math.sqrt(importanceScore) * 0.4)
        const starMat = new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.9, metalness: 0.1, roughness: 0.4 })
        const star = new THREE.Mesh(new THREE.SphereGeometry(size, 24, 24), starMat)
        const group = new THREE.Group()
        group.position.copy(center)
        group.add(star)
        // Planet rings
        const count = Math.min(10, Math.max(1, Math.floor(importanceScore / 12)))
        for (let i = 0; i < count; i++) {
          const orbit = new THREE.Group()
          const dist = 6 + i * 3 + Math.random() * 1.5
          orbit.userData = { speed: 0.01 + Math.random() * 0.02 }
          const planetSize = Math.max(0.4, size * 0.35 - i * 0.02)
          const hue = 0.55 + Math.random() * 0.3
          const col = new THREE.Color().setHSL(hue, 0.8, 0.6)
          const planet = new THREE.Mesh(new THREE.SphereGeometry(planetSize, 16, 16), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.3 }))
          planet.position.set(dist, 0, 0)
          orbit.add(planet)
          // faint ring line
          const ringGeo = new THREE.RingGeometry(dist - 0.02, dist + 0.02, 64)
          const ringMat = new THREE.MeshBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
          const ring = new THREE.Mesh(ringGeo, ringMat)
          ring.rotation.x = Math.PI / 2
          group.add(ring)
          group.add(orbit)
        }
        group.userData = { label, size }
        systems.add(group)
        return group
      }

      // Place systems around a core
      const placeOnSpiral = (idx, total, radius = 220) => {
        const t = idx / total
        const r = 40 + t * radius
        const angle = t * Math.PI * 6 + (idx % 4) * (Math.PI / 2)
        return new THREE.Vector3(Math.cos(angle) * r, (Math.random() - 0.5) * 12, Math.sin(angle) * r)
      }

      // Leaderboard systems
      leaderboard.forEach((u, i) => {
        const imp = importance(u)
        const pos = placeOnSpiral(i, Math.max(leaderboard.length, 1))
        createSystem(u.full_name || u.username || 'Contributor', imp, 0xffffff, pos)
      })

      // You at the center
      const you = createSystem(user?.full_name || user?.username || 'You', 90, 0x9ae6ff, new THREE.Vector3(0, 0, 0))
      const youLight = new THREE.PointLight(0x9ae6ff, 2, 200)
      you.add(youLight)

      // Hover label
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2(1, 1)
      const labelEl = document.createElement('div')
      labelEl.style.position = 'absolute'
      labelEl.style.pointerEvents = 'none'
      labelEl.style.padding = '4px 8px'
      labelEl.style.borderRadius = '6px'
      labelEl.style.fontFamily = 'JetBrains Mono, monospace'
      labelEl.style.fontSize = '12px'
      labelEl.style.color = '#0b0e14'
      labelEl.style.background = 'rgba(255,255,255,0.9)'
      labelEl.style.transform = 'translate(-50%, -140%)'
      labelEl.style.display = 'none'
      container.appendChild(labelEl)

      const onPointerMove = (e) => {
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      }
      renderer.domElement.addEventListener('mousemove', onPointerMove)

      // Resize
      const onResize = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // Animate
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate)
        galaxy.rotation.z += 0.0006
        systems.children.forEach(g => {
          g.children.forEach(child => {
            if (child.type === 'Group' && child.userData?.speed) {
              child.rotation.y += child.userData.speed
            }
          })
        })
        controls.update()

        // Hover detection
        raycaster.setFromCamera(mouse, camera)
        const spheres = []
        systems.children.forEach(g => {
          g.traverse(o => { if (o.isMesh && o.geometry?.type === 'SphereGeometry') spheres.push(o) })
        })
        const hits = raycaster.intersectObjects(spheres, true)
        if (hits.length > 0) {
          const obj = hits[0].object
          const group = obj.parent
          labelEl.textContent = group?.parent?.userData?.label || group?.userData?.label || 'Contributor'
          const sp = hits[0].point.clone().project(camera)
          const x = (sp.x * 0.5 + 0.5) * renderer.domElement.clientWidth
          const y = (-sp.y * 0.5 + 0.5) * renderer.domElement.clientHeight
          labelEl.style.left = `${x}px`
          labelEl.style.top = `${y}px`
          labelEl.style.display = 'block'
        } else {
          labelEl.style.display = 'none'
        }

        renderer.render(scene, camera)
      }
      animate()

      galaxyRef.current = { renderer, scene, camera, controls, container, labelEl }

      setLoading(false)
    } catch (e) {
      console.error('Three init failed', e)
      setError('3D rendering failed to initialize.')
      setLoading(false)
    }
  }

  // Bootstrap scene once leaderboard is available
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/leaderboard')
        const data = await res.json()
        const users = res.ok ? (data.users || []) : []
        if (!mounted) return
        await bootstrapThree(users)
      } catch (e) {
        if (mounted) setError('Failed to load cluster data')
      }
    }
    load()
    return () => {
      mounted = false
      cancelAnimationFrame(animationRef.current)
      const g = galaxyRef.current
      if (g?.renderer && g?.container) {
        g.container.removeChild(g.renderer.domElement)
        g.labelEl && g.container.removeChild(g.labelEl)
      }
    }
  }, [])

  // done above

  return (
    <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#0b0e14' }}>
      <div style={{ position: 'absolute', left: 16, top: 16, color: 'white', fontFamily: 'JetBrains Mono, monospace', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <NavLink to="/" style={{ color: '#0b0e14', background: '#ffffff', padding: '6px 10px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>Home</NavLink>
        <div style={{ fontWeight: 700 }}>Nova Cluster</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Orbit with mouse, scroll to zoom</div>
        {error && <div style={{ color: '#fecaca', marginLeft: 12 }}>{error}</div>}
      </div>
    </div>
  )
}
