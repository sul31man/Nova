import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Education.css'

export default function LearningPath() {
  const { user, token } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
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

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

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
        body: JSON.stringify({ plan, inputs: form })
      })
      const data = await response.json()
      if (response.ok) {
        setSaveMessage('✅ Plan saved to your profile!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(`❌ ${data.error || 'Failed to save plan'}`)
      }
    } catch (e) {
      setSaveMessage('❌ Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="education-container">
      <div className="education-content">
        <h1 className="edu-title">Your Learning Path</h1>
        <p className="edu-subtitle">Figure out what you want to build and generate a step‑by‑step plan.</p>

        <div className="edu-steps">
          <div className={`edu-step ${step === 1 ? 'active' : ''}`}>1. Your Goals</div>
          <div className={`edu-step ${step === 2 ? 'active' : ''}`}>2. Constraints</div>
          <div className={`edu-step ${step === 3 ? 'active' : ''}`}>3. Your Plan</div>
        </div>

        {step === 1 && (
          <div className="edu-card">
            <h3>What do you want to build?</h3>
            <div className="form-field">
              <label>Interests</label>
              <textarea rows={3} value={form.interests} onChange={(e)=>handleChange('interests', e.target.value)} placeholder="e.g., AI assistants, robotics, web apps" />
            </div>
            <div className="form-field">
              <label>Target skills (comma separated)</label>
              <input value={form.target_skills} onChange={(e)=>handleChange('target_skills', e.target.value)} placeholder="Python, React, CAD" />
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={()=>setStep(2)} disabled={!form.interests && !form.target_skills}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="edu-card">
            <h3>Your constraints</h3>
            <div className="grid-2">
              <div className="form-field">
                <label>Timeframe (weeks)</label>
                <input type="number" min="1" value={form.timeframe_weeks} onChange={(e)=>handleChange('timeframe_weeks', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Hours per week</label>
                <input type="number" min="1" value={form.hours_per_week} onChange={(e)=>handleChange('hours_per_week', e.target.value)} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-field">
                <label>Starting level</label>
                <select value={form.starting_level} onChange={(e)=>handleChange('starting_level', e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-field">
                <label>Preferred modality</label>
                <select value={form.modality} onChange={(e)=>handleChange('modality', e.target.value)}>
                  <option value="mixed">Mixed</option>
                  <option value="video">Video-first</option>
                  <option value="text">Text-first</option>
                  <option value="project">Project-first</option>
                </select>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-actions">
              <button className="btn-secondary" onClick={()=>setStep(1)}>Back</button>
              <button className="btn-primary" onClick={submitForPlan} disabled={loading}>{loading ? 'Generating…' : 'Generate my plan'}</button>
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
                  <button className="save-plan-btn" onClick={savePlan} disabled={saving}>{saving ? 'Saving…' : 'Save to Profile'}</button>
                  {saveMessage && <div className="save-plan-msg">{saveMessage}</div>}
                </div>
              </div>
            </div>
            <div className="edu-card">
              <h3>Weekly Breakdown</h3>
              {plan.weeks?.map((w,i)=> (
                <div key={i} className="week-card">
                  <div className="week-header">Week {w.week}: {w.theme}</div>
                  <ul>
                    {w.sessions?.map((s,j)=> (
                      <li key={j}><strong>{s.title}</strong> — {s.duration_hours}h</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

