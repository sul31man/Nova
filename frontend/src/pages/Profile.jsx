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
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    avatar_url: user?.avatar_url || ''
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
