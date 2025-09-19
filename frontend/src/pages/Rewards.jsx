import React from 'react'
import './Home.css'

export default function Rewards() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Rewards in the Nova Cluster</h1>
        <p className="home-subtitle">Anyone can build. The more you prove yourself, the more the Scheduler amplifies you.</p>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">How You Earn</h2>
          
          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Engineering Missions</h3>
            <p className="product-description">• Complete real-world tasks decomposed into missions.</p>
            <p className="product-description">• From CAD annotation to prototyping to full systems design.</p>
            <p className="product-description">• Every validated output pays out credits instantly.</p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. Forging the Morphic IDE</h3>
            <p className="product-description">• Contribute directly to humanity's open-source workbench.</p>
            <p className="product-description">• Build modules, integrate toolchains, improve UX.</p>
            <p className="product-description">• Earn credits and eternal recognition inside the IDE.</p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. Posting Missions</h3>
            <p className="product-description">• Anyone, at any level, can post missions.</p>
            <p className="product-description">• Have an idea, a part to design, or a system to test? Put it to the cluster.</p>
            <p className="product-description">• The Scheduler distributes it and Operators rise to build.</p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>4. Scaling Projects</h3>
            <p className="product-description">• As you gain levels, your posted missions gain more visibility, more contributors, and more resources.</p>
            <p className="product-description">• Your influence grows as the Scheduler entrusts you with squads, swarms, and access to capital.</p>
          </div>
          
          <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>
        </section>

        <section className="product-section">
          <h2 className="section-title">The Operator Path</h2>
          
          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Level 0 → Initiate</h3>
            <p className="product-description">• Anonymous node.</p>
            <p className="product-description">• Scheduler scaffolds your first micro-mission.</p>
            <p className="product-description">• Earn your first credits and activate your Operator Card.</p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Level 1 → Recognised Node</h3>
            <p className="product-description">• Officially part of the cluster.</p>
            <p className="product-description">• Complete basic missions and begin posting small ones of your own.</p>
            <p className="product-description">• Scheduler ensures steady tasks to build momentum.</p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Level 2 → Active Builder</h3>
            <p className="product-description">• First squads unlocked — Scheduler merges you into collaborative projects.</p>
            <p className="product-description">• Missions you post gain more reach and visibility.</p>
            <p className="product-description">• Initial access to shared resources (datasets, software credits).</p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Level 3 → Specialist Node</h3>
            <p className="product-description">• Recognised for proven strengths.</p>
            <p className="product-description">• Routed to high-value, domain-specific missions.</p>
            <p className="product-description">• Your posted missions attract stronger Operators.</p>
            <p className="product-description">• Mentor bonuses available.</p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Level 4 → Squad Leader</h3>
            <p className="product-description">• Scheduler entrusts you with squads to lead.</p>
            <p className="product-description">• Missions you post can scale into squad-level projects.</p>
            <p className="product-description">• Access to funding credits, prototyping kits, and labs.</p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Level 5 → Grand Architect</h3>
            <p className="product-description">• Elevated to the Council of Builders.</p>
            <p className="product-description">• Missions you post are routed to swarms and civilisation-scale projects.</p>
            <p className="product-description">• Scheduler unlocks maximum resources: manufacturers, funding pools, strategic partners.</p>
            <p className="product-description">• You don't just build — you architect the cluster itself.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
