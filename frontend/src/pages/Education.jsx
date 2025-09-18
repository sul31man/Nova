import React, { useState } from 'react'
import './Education.css'

export default function Education() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)

  const [form, setForm] = useState({
    interests: '',
    target_skills: '',
    timeframe_weeks: 4,
    hours_per_week: 6,
    starting_level: 'beginner',
    modality: 'mixed'
  })

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const submitForPlan = async () => {
    setLoading(true)
    setError('')
    setPlan(null)
    try {
      const res = await fetch('/api/education/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan')
      setPlan(data)
      setStep(3)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="education-container">
      <div className="education-content">
        <h1 className="edu-title">Learn-to-earn: Spoon-fed upskilling</h1>
        <p className="edu-subtitle">We figure out your goals and build the shortest path to mastery.</p>

        {/* Steps header */}
        <div className="edu-steps">
          <div className={`edu-step ${step === 1 ? 'active' : ''}`}>1. Your Goals</div>
          <div className={`edu-step ${step === 2 ? 'active' : ''}`}>2. Preferences</div>
          <div className={`edu-step ${step === 3 ? 'active' : ''}`}>3. Your Plan</div>
        </div>

        {step === 1 && (
          <div className="edu-card">
            <h3>What do you want to build?</h3>
            <div className="form-field">
              <label>Interests (what excites you?)</label>
              <textarea
                value={form.interests}
                onChange={(e) => handleChange('interests', e.target.value)}
                rows={3}
                placeholder="e.g., AI agents, chip design, bioinformatics, robotics..."
              />
            </div>

            <div className="form-field">
              <label>Target skills (comma separated)</label>
              <input
                type="text"
                value={form.target_skills}
                onChange={(e) => handleChange('target_skills', e.target.value)}
                placeholder="Python, React, CUDA, FEniCSx, control theory"
              />
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={() => setStep(2)} disabled={!form.interests && !form.target_skills}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="edu-card">
            <h3>Your constraints</h3>
            <div className="grid-2">
              <div className="form-field">
                <label>Timeframe (weeks)</label>
                <input
                  type="number"
                  min="1"
                  value={form.timeframe_weeks}
                  onChange={(e) => handleChange('timeframe_weeks', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Hours per week</label>
                <input
                  type="number"
                  min="1"
                  value={form.hours_per_week}
                  onChange={(e) => handleChange('hours_per_week', e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-field">
                <label>Starting level</label>
                <select
                  value={form.starting_level}
                  onChange={(e) => handleChange('starting_level', e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-field">
                <label>Preferred modality</label>
                <select
                  value={form.modality}
                  onChange={(e) => handleChange('modality', e.target.value)}
                >
                  <option value="mixed">Mixed</option>
                  <option value="video">Video-first</option>
                  <option value="text">Text-first</option>
                  <option value="project">Project-first</option>
                </select>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" onClick={submitForPlan} disabled={loading}>
                {loading ? 'Generating…' : 'Generate my plan'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && plan && (
          <div className="edu-plan">
            <div className="edu-card">
              <h3>Plan Summary</h3>
              <p><strong>Objective:</strong> {plan.summary?.objective}</p>
              <p><strong>Duration:</strong> {plan.summary?.duration_weeks} weeks • {plan.summary?.weekly_hours} hrs/week</p>
              {plan.summary?.recommended_stack?.length > 0 && (
                <p><strong>Recommended stack:</strong> {plan.summary.recommended_stack.join(', ')}</p>
              )}
            </div>

            {plan.weeks?.map((w) => (
              <div key={w.week} className="edu-card">
                <h3>Week {w.week}: {w.theme}</h3>
                <div className="sessions">
                  {w.sessions?.map((s, idx) => (
                    <div key={idx} className="session">
                      <div className="session-head">
                        <div className="session-title">{s.title}</div>
                        <div className="session-duration">{s.duration_hours}h</div>
                      </div>
                      <ul className="session-tasks">
                        {s.tasks?.map((t, i) => (<li key={i}>{t}</li>))}
                      </ul>
                      {s.resources?.length > 0 && (
                        <div className="resources">
                          {s.resources.map((r, i) => (
                            <a key={i} href={r.url} target="_blank" rel="noreferrer" className="resource-link">{r.title}</a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mini-assessment">
                  <h4>Mini-assessment</h4>
                  <ul>
                    {w.mini_assessment?.map((m, i) => (<li key={i}>{m}</li>))}
                  </ul>
                </div>
                <div className="project">
                  <h4>Weekly Project: {w.project?.title}</h4>
                  <p>{w.project?.description}</p>
                  <ul>
                    {w.project?.acceptance_criteria?.map((c, i) => (<li key={i}>{c}</li>))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="edu-card">
              <h3>Capstone: {plan.capstone?.title}</h3>
              <p>{plan.capstone?.description}</p>
              <ul>
                {plan.capstone?.acceptance_criteria?.map((c, i) => (<li key={i}>{c}</li>))}
              </ul>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>Adjust inputs</button>
              <button className="btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


