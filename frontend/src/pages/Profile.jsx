import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

export default function Profile() {
  const { user, token, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState('')
  const [learningPlans, setLearningPlans] = useState([])
  const [applications, setApplications] = useState({ sent: [], received: [] })
  const [appsLoading, setAppsLoading] = useState(false)
  const [activeAppTab, setActiveAppTab] = useState('sent')
  // Character report
  const [reportInputs, setReportInputs] = useState({ about: '', interests: '', years_experience: '', preferred_roles: '', projects: '' })
  const [reportLoading, setReportLoading] = useState(false)
  const [characterReport, setCharacterReport] = useState(null)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    avatar_url: user?.avatar_url || '',
    status: user?.status || ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setMessage('') // Clear message when user types
  }

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
    setFormData({
      ...formData,
      skills: skillsArray
    })
  }

  const handleReportInput = (e) => {
    const { name, value } = e.target
    setReportInputs(prev => ({ ...prev, [name]: value }))
  }

  const generateCharacterReport = async () => {
    if (!token) return
    setReportLoading(true)
    try {
      const res = await fetch('/api/profile/character-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reportInputs)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate character report')
      setCharacterReport(data)
    } catch (e) {
      setMessage(e.message)
    } finally {
      setReportLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await updateProfile(formData)
    
    if (result.success) {
      setMessage('Profile updated successfully!')
      setEditing(false)
    } else {
      setMessage(result.error || 'Failed to update profile')
    }
    
    setLoading(false)
  }

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      avatar_url: user?.avatar_url || ''
    })
    setEditing(false)
    setMessage('')
  }

  // Fetch saved learning plans
  useEffect(() => {
    const fetchPlans = async () => {
      if (!user || !token) return
      setPlansLoading(true)
      setPlansError('')
      try {
        const res = await fetch('/api/education/my-plans', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch learning plans')
        setLearningPlans(data.plans || [])
      } catch (e) {
        setPlansError(e.message)
      } finally {
        setPlansLoading(false)
      }
    }
    fetchPlans()

    const fetchApplications = async () => {
      if (!user || !token) return
      setAppsLoading(true)
      try {
        const res = await fetch('/api/my-applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch applications')
        setApplications(data)
      } catch (e) {
        console.error('Error fetching applications:', e)
      } finally {
        setAppsLoading(false)
      }
    }
    fetchApplications()
  }, [user, token])

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Refresh applications
        const res = await fetch('/api/my-applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const appData = await res.json()
        if (res.ok) setApplications(appData)
        setMessage(`Application ${action} successfully!`)
      } else {
        setMessage(data.error || `Failed to ${action} application`)
      }
    } catch (error) {
      console.error('Error updating application:', error)
      setMessage(`Failed to ${action} application`)
    }
  }

  const getInitials = (name) => {
    if (!name && user?.username) return user.username.charAt(0).toUpperCase()
    if (!name) return 'U'
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <h1>Access Denied</h1>
          <p>You need to be logged in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} />
              ) : (
                <span>{getInitials(user.full_name)}</span>
              )}
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-title">
                {user.full_name || user.username}
              </h1>
              <p className="profile-username">@{user.username}</p>
              {user.status && (
                <p className="profile-username" style={{ color: '#000', fontWeight: 600 }}>Status: {user.status}</p>
              )}
              <p className="profile-email">{user.email}</p>
              <div className="profile-stats">
                <span className="profile-credits">{user.credits || 0} credits</span>
                <span className="profile-join-date">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {!editing && (
            <button 
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="profile-body">
          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-field">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="skills">Skills</label>
                  <input
                    type="text"
                    id="skills"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="e.g., Python, React, Machine Learning"
                  />
                  <small>Separate skills with commas</small>
                </div>

              <div className="form-field">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="">Select status</option>
                    <option value="Grand Architect">Grand Architect</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Builder">Builder</option>
                    <option value="Architect">Architect</option>
                    <option value="Operator">Operator</option>
                    <option value="Researcher">Researcher</option>
                  </select>
                </div>

                <div className="form-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor="missions_completed">Missions Completed</label>
                    <input type="number" id="missions_completed" name="missions_completed" value={formData.missions_completed || ''} onChange={handleInputChange} placeholder="0" />
                  </div>
                  <div>
                    <label htmlFor="squads_led">Squads Led</label>
                    <input type="number" id="squads_led" name="squads_led" value={formData.squads_led || ''} onChange={handleInputChange} placeholder="0" />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="avatar_url">Avatar URL</label>
                  <input
                    type="url"
                    id="avatar_url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="profile-section">
                <h3>About</h3>
                <p className="profile-bio">
                  {user.bio || 'No bio provided yet.'}
                </p>
              </div>

              <div className="profile-section">
                <h3>Skills</h3>
                <div className="skills-list">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="no-skills">No skills listed yet.</p>
                  )}
                </div>
              </div>

              <div className="profile-section">
                <h3>Activity</h3>
                <div className="activity-stats">
                  <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Tasks Completed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Projects Created</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{user.credits || 0}</span>
                    <span className="stat-label">Credits Earned</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>Learning Plans</h3>
                {plansLoading && <p>Loading your plans…</p>}
                {plansError && <p style={{ color: '#dc2626' }}>{plansError}</p>}
                {!plansLoading && !plansError && (
                  learningPlans.length > 0 ? (
                    <div className="plans-list">
                      {learningPlans.map(plan => (
                        <div key={plan.id} className="plan-card">
                          <div className="plan-card-main">
                            <div className="plan-title">{plan.title}</div>
                            <div className="plan-meta">
                              Saved on {new Date(plan.created_at).toLocaleDateString()} • {plan.plan_data?.summary?.duration_weeks || '?'} weeks
                            </div>
                          </div>
                          <div className="plan-actions">
                            <a className="plan-view-btn" href={`/education?plan=${plan.id}`}>View</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-skills">No learning plans saved yet. Generate a plan in Education and click "Save Plan".</p>
                  )
                )}
              </div>

              {/* Character Report Section */}
              <div className="profile-section">
                <h3>Character Report</h3>
                <p className="profile-bio" style={{ marginBottom: '1rem' }}>
                  Generate a concise snapshot of your technical profile, interests, and collaboration style to help Nova pair you with the right education, tasks, and teammates.
                </p>
                <div className="profile-form" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                  <div className="form-field">
                    <label htmlFor="about">About you</label>
                    <textarea id="about" name="about" rows="3" placeholder="Share background, goals, what you enjoy working on" value={reportInputs.about} onChange={handleReportInput} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="interests">Interests</label>
                    <input id="interests" name="interests" placeholder="e.g., AI safety, web apps, robotics" value={reportInputs.interests} onChange={handleReportInput} />
                  </div>
                  <div className="form-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label htmlFor="years_experience">Years of experience</label>
                      <input id="years_experience" name="years_experience" placeholder="e.g., 0-1, 2-4, 5+" value={reportInputs.years_experience} onChange={handleReportInput} />
                    </div>
                    <div>
                      <label htmlFor="preferred_roles">Preferred roles</label>
                      <input id="preferred_roles" name="preferred_roles" placeholder="e.g., frontend, data, product" value={reportInputs.preferred_roles} onChange={handleReportInput} />
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="projects">Notable projects</label>
                    <input id="projects" name="projects" placeholder="Links or short notes (optional)" value={reportInputs.projects} onChange={handleReportInput} />
                  </div>
                  <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                    <button className="save-btn" type="button" onClick={generateCharacterReport} disabled={reportLoading}>
                      {reportLoading ? 'Generating…' : 'Generate Character Report'}
                    </button>
                  </div>
                </div>

                {characterReport && (
                  <div className="plan-card" style={{ marginTop: '1rem' }}>
                    <div className="plan-card-main">
                      <div className="plan-title">Your Character Snapshot</div>
                      <div className="plan-meta">Confidence: {(characterReport.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <strong>Strengths</strong>
                        <ul>
                          {(characterReport.strengths || []).map((s, i) => (<li key={i}>{s}</li>))}
                        </ul>
                      </div>
                      <div>
                        <strong>Growth Areas</strong>
                        <ul>
                          {(characterReport.growth_areas || []).map((s, i) => (<li key={i}>{s}</li>))}
                        </ul>
                      </div>
                      <div>
                        <strong>Technical Profile</strong>
                        <p style={{ margin: 0 }}>Primary: {(characterReport.technical_profile?.primary_stack || []).join(', ') || '—'}</p>
                        <p style={{ margin: 0 }}>Secondary: {(characterReport.technical_profile?.secondary_stack || []).join(', ') || '—'}</p>
                        <p style={{ margin: 0 }}>Seniority: {characterReport.technical_profile?.seniority || '—'}</p>
                      </div>
                      <div>
                        <strong>Traits & Interests</strong>
                        <p style={{ margin: 0 }}>Traits: {(characterReport.character_traits || []).join(', ') || '—'}</p>
                        <p style={{ margin: 0 }}>Interests: {(characterReport.interests || []).join(', ') || '—'}</p>
                        <p style={{ margin: 0 }}>Age: {characterReport.estimated_age_bracket || '—'}</p>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <strong>Pairing Recommendations</strong>
                        <ul>
                          {(characterReport.pairing_recommendations?.education || []).map((s, i) => (<li key={i}>Education: {s}</li>))}
                          {(characterReport.pairing_recommendations?.tasks || []).map((s, i) => (<li key={i}>Tasks: {s}</li>))}
                          {(characterReport.pairing_recommendations?.teammates || []).map((s, i) => (<li key={i}>Teammates: {s}</li>))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Applications Section */}
              <div className="profile-section">
                <h3>Task Applications</h3>
                {appsLoading ? (
                  <p>Loading applications...</p>
                ) : (
                  <div className="applications-tabs">
                    <div className="tab-nav">
                      <button 
                        className={`tab-btn ${activeAppTab === 'sent' ? 'active' : ''}`}
                        onClick={() => setActiveAppTab('sent')}
                      >
                        Sent ({applications.sent?.length || 0})
                      </button>
                      <button 
                        className={`tab-btn ${activeAppTab === 'received' ? 'active' : ''}`}
                        onClick={() => setActiveAppTab('received')}
                      >
                        Received ({applications.received?.length || 0})
                      </button>
                    </div>
                    
                    <div className="tab-content">
                      {/* Sent Applications */}
                      {activeAppTab === 'sent' && (
                        <div className="tab-panel">
                          {applications.sent?.length > 0 ? (
                            <div className="applications-list">
                              {applications.sent.map(app => (
                                <div key={app.id} className="application-card">
                                  <div className="app-header">
                                    <h4>{app.task_title}</h4>
                                    <span className={`status-badge ${app.status}`}>{app.status}</span>
                                  </div>
                                  <p className="app-message">"{app.application_message}"</p>
                                  <div className="app-meta">
                                    <span>To: {app.task_creator}</span>
                                    <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                                    <span>Credits: {app.reward_credits}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-applications">No applications sent yet.</p>
                          )}
                        </div>
                      )}

                      {/* Received Applications */}
                      {activeAppTab === 'received' && (
                        <div className="tab-panel">
                          {applications.received?.length > 0 ? (
                            <div className="applications-list">
                              {applications.received.map(app => (
                                <div key={app.id} className="application-card">
                                  <div className="app-header">
                                    <h4>{app.task_title}</h4>
                                    <span className={`status-badge ${app.status}`}>{app.status}</span>
                                  </div>
                                  <p className="app-message">"{app.application_message}"</p>
                                  <div className="app-meta">
                                    <span>From: {app.applicant_username}</span>
                                    <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                                  </div>
                                  {app.status === 'pending' && (
                                    <div className="app-actions">
                                      <button 
                                        className="btn-accept"
                                        onClick={() => handleApplicationAction(app.id, 'accepted')}
                                      >
                                        Accept
                                      </button>
                                      <button 
                                        className="btn-reject"
                                        onClick={() => handleApplicationAction(app.id, 'rejected')}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-applications">No applications received yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
