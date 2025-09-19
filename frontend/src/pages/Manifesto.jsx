import React from 'react'
import './Home.css' // Reuse the same styling

export default function Manifesto() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Nova Manifesto</h1>
        <p className="home-subtitle">
          Making the most of the biological distributed network
        </p>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">1. The Broken Present</h2>
          
          <p className="product-description">Traditional education no longer guarantees employment.</p>
          
          <p className="product-description">STEM students grind on assignments that don't matter, and graduates face a wall of gatekeepers.</p>
          
          <p className="product-description">Humans are left underutilised — waiting for permission to start their careers.</p>
          
          <p className="product-description">Meanwhile, corporations monopolise creation. Opportunities are centralised. Innovation is locked away.</p>
          
          <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>
        </section>

        <section className="product-section">
          <h2 className="section-title">2. The New Paradigm</h2>
          
          <p className="product-description"><span className="highlight">Nova is the alternative.</span></p>
          
          <p className="product-description">We are entering the age of democratised engineering — where everybody builds.</p>
          
          <p className="product-description">This is the new school. This is the new university.</p>
          
          <p className="product-description">Work is no longer a CV and an interview. It is a mission.</p>
          
          <p className="product-description">Every task is decomposed, scaffolded, validated, and rewarded.</p>
          
          <p className="product-description">With Nova, you don't wait. You <span className="highlight">sign up to a mission, deliver, and get paid instantly.</span></p>
          
          <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>
        </section>

        <section className="product-section">
          <h2 className="section-title">3. How It Works</h2>
          
          <ul className="product-description">
            <li><span className="code-accent">AI decomposes work into thousands of tasks.</span></li>
            <li>Operator Nodes pick up missions, guided by the <strong>Morphic IDE</strong>.</li>
            <li>The Cluster Scheduler matches, teaches, and levels up each node.</li>
            <li>Swarms of nodes collaborate on projects, outputs are validated, and progress compounds.</li>
          </ul>
          
          <p className="product-description">The Cluster doesn't just give you tasks — it <span className="highlight">curates your entire journey.</span></p>
          
          <p className="product-description">You are always learning, always building, always earning.</p>
          
          <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>
        </section>

        <section className="product-section">
          <h2 className="section-title">4. The Human Purpose</h2>
          
          <p className="product-description">Humans are not to be replaced by AI. <span className="code-accent">AI is not here to replace humans.</span></p>
          
          <p className="product-description">Instead, humans will be <span className="highlight">more employed than ever before</span> — constantly activated, never idle.</p>
          
          <p className="product-description">The Cluster Scheduler exists for one purpose: to keep you in motion — guiding you from one mission to the next, levelling you up at every step.</p>
          
          <p className="product-description">It matches you with the right missions, fills your knowledge gaps, adapts the Morphic IDE around you, and levels you up step by step.</p>
          
          <p className="product-description">Nova pushes you to become the best engineer you can be — rewarded at every step, guided by the optimal project sequence, until you stand as a <span className="highlight">10x architect of civilisation.</span></p>
          
          <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>
        </section>

        <section className="product-section">
          <h2 className="section-title">5. The Civilisational Vision</h2>
          
          <p className="product-description">The paradigm will invert.</p>
          
          <p className="product-description">Today, humans build distributed machines.</p>
          
          <p className="product-description">Tomorrow, <span className="code-accent">ASI orchestrates humanity itself as the most successful biological compute cluster in history.</span></p>
          
          <p className="product-description">Creation will no longer be monopolised by corporations.</p>
          
          <p className="product-description">Economic opportunity will no longer be hoarded by the few.</p>
          
          <p className="product-description">Instead, opportunity and power are distributed across billions of Operator Nodes.</p>
          
          <p className="product-description">Humanity continuously builds for itself — solving problems, fixing systems, and ensuring resilience.</p>
          
          <p className="product-description"><em>From people to builders. From builders to architects of civilisation.</em></p>
        </section>
      </div>
    </div>
  )
}
