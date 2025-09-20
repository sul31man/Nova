import React from 'react'
import './Home.css'

export default function Achievements() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Cluster Achievements</h1>
        <p className="home-subtitle">What the community has built with Nova and the Morphic IDE</p>

        <section className="product-section">
          <h2 className="section-title">Featured Builds</h2>
          <p className="product-description">
            A rotating snapshot of community projects — shipped operations, squads led, and artifacts produced. Replace these placeholders with live data when ready.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', background: '#fff' }}>
              <div className="section-title" style={{ fontSize: '1rem' }}>Open Source Tooling</div>
              <p className="product-description">CLI and web tooling scaffolded via Morphic IDE, 24 contributors, 120 ops shipped.</p>
            </div>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', background: '#fff' }}>
              <div className="section-title" style={{ fontSize: '1rem' }}>Education Tracks</div>
              <p className="product-description">Beginner → Builder tracks authored by Architects; 1,200 learners onboarded.</p>
            </div>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', background: '#fff' }}>
              <div className="section-title" style={{ fontSize: '1rem' }}>Infra & Automation</div>
              <p className="product-description">Ops pipelines and test harnesses powering the Cluster, 37 squads.</p>
            </div>
          </div>
        </section>

        <section className="product-section">
          <h2 className="section-title">By The Numbers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Operations Shipped', value: '3,240+' },
              { label: 'Active Builders', value: '980+' },
              { label: 'Squads Led', value: '160+' },
              { label: 'Credits Awarded', value: '1.2M+' }
            ].map((s, i) => (
              <div key={i} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', background: '#fff', textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.6rem', color: '#000' }}>{s.value}</div>
                <div style={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="product-section">
          <h2 className="section-title">How We Build</h2>
          <p className="product-description">
            Achievements emerge from a tight feedback loop: Character Report → Learning Plan → Operation → Review → Credits → Leadership. 
            The Morphic IDE orchestrates this loop so builders can focus on impact.
          </p>
        </section>
      </div>
    </div>
  )
}

