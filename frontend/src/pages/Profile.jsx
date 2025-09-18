import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
