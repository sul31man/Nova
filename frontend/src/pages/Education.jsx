import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ProjectIDE from '../components/ProjectIDE'
import './Education.css'

export default function Education() {
  const { user, token } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const [currentProject, setCurrentProject] = useState(null)
  const [showIDE, setShowIDE] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

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

  const startProject = (project) => {
    setCurrentProject(project)
    setShowIDE(true)
  }

  const completeProject = () => {
    alert('🎉 Project completed! Moving to next project...')
    setShowIDE(false)
    setCurrentProject(null)
    // Could advance to next project in sequence here
  }

  const exitIDE = () => {
    setShowIDE(false)
    setCurrentProject(null)
  }

  const savePlan = async () => {
    if (!user || !token || !plan) {
      setSaveMessage('Please sign in to save your plan')
      return
    }

    setSaving(true)
    setSaveMessage('')
    
    try {
      const response = await fetch('/api/education/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: plan,
          inputs: form
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSaveMessage('✅ Plan saved to your profile!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(`❌ ${data.error || 'Failed to save plan'}`)
      }
    } catch (error) {
      setSaveMessage('❌ Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  // Show IDE if a project is active
  if (showIDE && currentProject) {
    return (
      <div className="education-container">
        <div className="ide-header-bar">
          <button className="exit-ide-btn" onClick={exitIDE}>
            ← Back to Plan
          </button>
          <h2>Project: {currentProject.title}</h2>
        </div>
        <ProjectIDE 
          project={currentProject} 
          onComplete={completeProject}
        />
      </div>
    )
  }

  return (
    <div className="education-container">
      <div className="education-content">
        <h1 className="edu-title">Learn-to-earn: Spoon-fed upskilling</h1>
        <p className="edu-subtitle">We figure out your goals and build the shortest path to mastery.</p>
        
        <div className="beginner-help">
          <div className="help-card">
            <h4>📚 How it works:</h4>
            <ol>
              <li><strong>Tell us your interests</strong> - What excites you? AI, web development, robotics?</li>
              <li><strong>Set your timeline</strong> - How fast do you want to learn?</li>
              <li><strong>Get your custom plan</strong> - Week-by-week with projects and resources</li>
              <li><strong>Code with our AI helper</strong> - Get instant help when you're stuck</li>
            </ol>
          </div>
        </div>

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
              <div className="field-help">
                Tell us what you're passionate about - we'll build your learning around it!
              </div>
              <textarea
                value={form.interests}
                onChange={(e) => handleChange('interests', e.target.value)}
                rows={3}
                placeholder="e.g., Building AI assistants, designing computer chips, developing web apps, robotics..."
              />
            </div>

            <div className="form-field">
              <label>Target skills (comma separated)</label>
              <div className="field-help">
                What specific technologies do you want to learn? Don't worry if you're not sure - we'll suggest the best ones.
              </div>
              <input
                type="text"
                value={form.target_skills}
                onChange={(e) => handleChange('target_skills', e.target.value)}
                placeholder="Python, React, CUDA, Machine Learning, etc."
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
              <div className="plan-summary-header">
                <div>
                  <h3>Plan Summary</h3>
                  <p><strong>Objective:</strong> {plan.summary?.objective}</p>
                  <p><strong>Duration:</strong> {plan.summary?.duration_weeks} weeks • {plan.summary?.weekly_hours} hrs/week</p>
                  {plan.summary?.recommended_stack?.length > 0 && (
                    <p><strong>Recommended stack:</strong> {plan.summary.recommended_stack.join(', ')}</p>
                  )}
                </div>
                <div className="save-plan-section">
                  <button 
                    className="save-plan-btn"
                    onClick={savePlan}
                    disabled={saving || !user}
                  >
                    {saving ? '💾 Saving...' : '💾 Save Plan'}
                  </button>
                  {!user && <p className="save-hint">Sign in to save your plan</p>}
                  {saveMessage && <p className="save-message">{saveMessage}</p>}
                </div>
              </div>
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
                  <div className="project-header">
                    <h4>Weekly Project: {w.project?.title}</h4>
                    <button 
                      className="start-project-btn"
                      onClick={() => startProject(w.project)}
                    >
                      🚀 Start Project
                    </button>
                  </div>
                  <p>{w.project?.description}</p>
                  <div className="acceptance-criteria">
                    <h5>Acceptance Criteria:</h5>
                    <ul>
                      {w.project?.acceptance_criteria?.map((c, i) => (<li key={i}>{c}</li>))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            <div className="edu-card">
              <div className="project-header">
                <h3>Capstone: {plan.capstone?.title}</h3>
                <button 
                  className="start-project-btn capstone-btn"
                  onClick={() => startProject(plan.capstone)}
                >
                  🎯 Start Capstone
                </button>
              </div>
              <p>{plan.capstone?.description}</p>
              <div className="acceptance-criteria">
                <h5>Success Criteria:</h5>
                <ul>
                  {plan.capstone?.acceptance_criteria?.map((c, i) => (<li key={i}>{c}</li>))}
                </ul>
              </div>
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


