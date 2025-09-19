import React from 'react'
import './Home.css'

export default function MorphicIDE() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">The Morphic IDE</h1>
        <p className="home-subtitle">Adaptive, ritualistic tooling for building with the Cluster</p>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">What Is It?</h2>
          <p className="product-description">
            The Morphic IDE is humanity's workbench.
          </p>
          <p className="product-description">
            It begins by scraping the scattered resources we have now — code, docs, tools — but becomes more. Every mission forges it further. Every Operator contributes to it. It is the living hub of open source, but a dynamic workbench that morphs to every mission.
          </p>
          <p className="product-description">
            It belongs to the people — it is their forge, their tool, their inheritance.
          </p>
        </section>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">Goals of the Morphic IDE</h2>
          
          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Humanity's Workbench</h3>
            <p className="product-description">
              • A single hub where all building happens — software, hardware, design, science.
            </p>
            <p className="product-description">
              • Replaces the fragmented ecosystem (GitHub, StackOverflow, docs, forums, IDEs) with a unified, living workspace.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. Adaptive & Morphing</h3>
            <p className="product-description">
              • Reshapes itself automatically to the mission at hand.
            </p>
            <p className="product-description">
              • CAD task → CAD interface.
            </p>
            <p className="product-description">
              • ML pipeline → data console.
            </p>
            <p className="product-description">
              • Logistics plan → operations dashboard.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. Learn-to-Earn Integration</h3>
            <p className="product-description">
              • Missing a skill? A micro-lesson appears instantly inside the mission.
            </p>
            <p className="product-description">
              • Complete it, apply it immediately, and get rewarded.
            </p>
            <p className="product-description">
              • Education stops being separate from work — it becomes the same thing.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>4. Validation & Feedback</h3>
            <p className="product-description">
              • Built-in validators, compilers, test suites.
            </p>
            <p className="product-description">
              • Instant confirmation of correctness — no waiting, no doubt.
            </p>
            <p className="product-description">
              • Ensures quality and triggers automatic credits on completion.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>5. Evolving Through Missions</h3>
            <p className="product-description">
              • The IDE itself is a living open-source project.
            </p>
            <p className="product-description">
              • Operators earn credits by forging it further: new modules, better UX, new integrations.
            </p>
            <p className="product-description">
              • Humanity doesn't just use the workbench — it builds the workbench.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>6. Universal Access</h3>
            <p className="product-description">
              • Minimal setup, usable instantly anywhere.
            </p>
            <p className="product-description">
              • Lightweight for beginners, advanced for specialists.
            </p>
            <p className="product-description">
              • Ensures everyone can build — from 14-year-olds coding games to engineers designing spacecraft.
            </p>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>7. The Scheduler's Surface</h3>
            <p className="product-description">
              • The Morphic IDE is more than a tool — it is the surface of the Scheduler's intelligence.
            </p>
            <p className="product-description">
              • It guides Operators into flow, scaffolds their missions, validates their output, and levels them up.
            </p>
            <p className="product-description">
              • It is where humanity and AI meet — the place where learning, building, and earning converge.
            </p>
          </div>
        </section>

        <div style={{ margin: '2rem 0', borderTop: '2px solid #ddd', paddingTop: '1rem' }}></div>

        <section className="product-section">
          <h2 className="section-title">Why Now?</h2>
          <p className="product-description">
            The future of IDEs will not look like the tools we know today. With AI woven into every layer, the barrier to entry collapses. Engineering transforms from an elite practice into a universal capability.
          </p>
          <p className="product-description">
            The Morphic IDE is the first of this new generation — adaptive, open-source, and alive — the workbench of humanity.
          </p>
        </section>

        <section className="product-section">
          <h2 className="section-title">Rewards</h2>
          <p className="product-description">
            Nova recognises contribution with clear, compounding rewards. As you build, you ascend through tiers that unlock status, credits, and leadership.
          </p>
          <p className="product-description">
            - Beginner → Learn and complete guided operations. Earn starter credits and your Operator Card.
          </p>
          <p className="product-description">
            - Builder → Ship independent operations with tests. Higher credit rates and priority access to missions.
          </p>
          <p className="product-description">
            - Architect → Design and lead squads. Squad bonus credits, governance weight, and curation rights.
          </p>
          <p className="product-description">
            - Grand Architect → Steward large initiatives across the Cluster. Premium multipliers and the ability to found new programs.
          </p>
          <p className="product-description">
            Credits are convertible within the ecosystem and signal trust. Your tier is displayed across the Cluster and in the Leaderboard.
          </p>
        </section>
      </div>
    </div>
  )
}
