import React from 'react'
import './Home.css'

export default function Missions() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Missions</h1>
        <p className="home-subtitle">How missions work and who publishes them</p>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">What Are Missions?</h2>
          <p className="product-description">
            • Missions are tasks posted by the Cluster, by companies, and by members themselves.
          </p>
          <p className="product-description">
            • They can be as small as fixing a script or as large as designing a subsystem for a new product.
          </p>
          <p className="product-description">
            • Each mission is scaffolded: you know the goal, the resources, and the reward before you begin.
          </p>
          <p className="product-description">
          • The Scheduler feeds you missions that cut straight to the signal — the right task, at the right moment, with zero wasted effort.
          </p>
          <p className="product-description">
          • Nova is not just a platform — it’s a self-reinforcing data engine. Every mission solved makes the Cluster sharper, the Scheduler smarter, and the Morphic IDE stronger. The workbench learns from civilisation itself.
          </p>
        </section>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">How Missions Work</h2>
          
          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Posted to the Cluster</h3>
            <p className="product-description">
              • Companies, members, and even the Cluster itself (via the Scheduler) post missions.
            </p>
            <p className="product-description">
              • All missions are published anonymously at first — you focus on the problem, not the poster.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. Routed by the Scheduler</h3>
            <p className="product-description">
              • The Scheduler assigns missions to Operators based on level, skills, and learning path.
            </p>
            <p className="product-description">
              • Early missions are simple → quick wins to build momentum.
            </p>
            <p className="product-description">
              • Later missions escalate → harder, more rewarding, squad-based.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. Built by Operators</h3>
            <p className="product-description">
              • Operators accept missions, fulfil them using their own tools (Phase 1), with AI-tutor assistance if needed.
            </p>
            <p className="product-description">
              • Progress is scaffolded so you're never "stuck at blank page."
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>4. Validated & Rewarded</h3>
            <p className="product-description">
              • Submissions pass through validation (tests, sims, peer checks).
            </p>
            <p className="product-description">
              • Once validated, credits are released instantly.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>5. Level Up</h3>
            <p className="product-description">
              • Each completed mission increases your Operator rank.
            </p>
            <p className="product-description">
              • Higher levels → bigger missions, more resources, squad leadership, and influence in the Cluster.
            </p>
          </div>
        </section>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">Who Publishes Missions?</h2>
          
          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Nova Core Team</h3>
            <p className="product-description">
              • Strategic initiatives that advance Nova's mission and platform development.
            </p>
            <p className="product-description">
              • Infrastructure projects, tool development, and ecosystem expansion.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. Partner Organisations</h3>
            <p className="product-description">
              • Research institutions, non-profits, and forward-thinking companies.
            </p>
            <p className="product-description">
              • Real-world problems that need innovative solutions and technical expertise.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. Community Members</h3>
            <p className="product-description">
              • Experienced Operators who identify opportunities and propose new missions.
            </p>
            <p className="product-description">
              • Open-source projects, creative endeavors, and experimental initiatives.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>4. The Scheduler</h3>
            <p className="product-description">
              • AI-driven mission generation based on emerging needs and opportunities.
            </p>
            <p className="product-description">
              • Dynamic mission creation that adapts to current capabilities and market demands.
            </p>
          </div>
        </section>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">Mission Types</h2>
          <p className="product-description">
            Missions come in various forms and complexity levels:
          </p>
          <p className="product-description">
            • <strong>Quick Tasks:</strong> Short-term projects that can be completed in hours or days
          </p>
          <p className="product-description">
            • <strong>Development Projects:</strong> Software development, feature implementation, and system building
          </p>
          <p className="product-description">
            • <strong>Research Initiatives:</strong> Scientific research, data analysis, and experimental projects
          </p>
          <p className="product-description">
            • <strong>Creative Endeavors:</strong> Design, content creation, and artistic projects
          </p>
          <p className="product-description">
            • <strong>Infrastructure:</strong> System architecture, deployment, and maintenance tasks
          </p>
        </section>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">Getting Started</h2>
          <p className="product-description">
            Ready to join your first mission? Browse available missions in the Operations section, or check out your personalised task recommendations in Execute.
          </p>
          <p className="product-description">
            Every mission completed brings us closer to a future where technology serves humanity's highest aspirations.
          </p>
        </section>
      </div>
    </div>
  )
}
