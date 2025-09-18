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

        <section className="product-section">
          <h2 className="section-title">What is Nova?</h2>
          <p className="product-description" style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#000' }}>MANIFESTO:</p>
          
          <p className="product-description">The future is one where we have <span className="highlight">democratised engineering</span> — where everybody is building.</p>
          
          <p className="product-description">This is the new school. This is the new university.</p>
          
          <p className="product-description">Education will be renovated: the barrier to entry collapses, and we all learn new skills on demand to contribute to society.</p>
          
          <p className="product-description">Humans are not to be replaced by AI. <span className="code-accent">AI is not here to replace humans.</span></p>
          
          <p className="product-description">Instead, humans will be <span className="highlight">more employed than ever before</span> — constantly activated, never idle.</p>
          
          <p className="product-description">Without purpose and work, humans decay. This system offers more purpose than humanity has ever known.</p>
          
          <p className="product-description">The AI–human coexistence will supercharge every individual, turning us into the <span className="highlight">most capable versions of ourselves.</span></p>
          
          <p className="product-description">The paradigm will invert: today, humans build distributed machines; tomorrow, <span className="code-accent">ASI will maximise the biological distributed network</span>, scheduling and managing us into the most successful compute cluster in history.</p>
          
          <p className="product-description">AI is abundant, but energy is scarce. While AI could complete tasks directly, it consumes compute and power each time. Train a human once, and they can repeat the task thousands of times at <span className="highlight">near-zero marginal cost.</span> Humans are the most energy-efficient distributed engines on the planet.</p>
          
          <p className="product-description">Traditional education no longer guarantees employment. <span className="highlight">We do.</span></p>
          
          <p className="product-description">In the age of democratised engineering, individuals will no longer rely solely on corporations to create the world around them.</p>
          
          <p className="product-description">A person posts their need — a new car part, a clinic, a community system.</p>
          
          <p className="product-description"><span className="code-accent">AI decomposes it into thousands of tasks.</span></p>
          
          <p className="product-description">Swarms of people design, source, assemble, and validate.</p>
          
          <p className="product-description">This shift gives <span className="highlight">more power to the people</span>: creation is no longer monopolised by large organisations.</p>
          
          <p className="product-description">It leads to less exploitation, because economic opportunity is distributed across billions, not concentrated in a few companies.</p>
          
          <p className="product-description">And it creates a safer future, where society continuously builds for itself, fixing each other's problems and ensuring resilience.</p>
        </section>
      </div>
    </div>
  )
}
