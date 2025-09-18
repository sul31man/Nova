import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Settings.css'

export default function Settings() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      taskUpdates: true,
      weeklyDigest: false,
      marketingEmails: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLastSeen: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  })

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const handlePreferenceChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const handleSaveSettings = () => {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', settings)
    alert('Settings saved! (This is a placeholder - implement API call)')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      console.log('Deleting account...')
      alert('Account deletion requested (This is a placeholder - implement API call)')
    }
  }

  if (!user) {
    return (
      <div className="settings-container">
        <div className="settings-content">
          <h1>Access Denied</h1>
          <p>You need to be logged in to access settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account preferences and privacy settings</p>
        </div>

        <div className="settings-layout">
          {/* Settings Navigation */}
          <div className="settings-nav">
            <button 
              className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button 
              className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy
            </button>
            <button 
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>

          {/* Settings Content */}
          <div className="settings-panel">
            {activeTab === 'account' && (
              <div className="settings-section">
                <h2>Account Information</h2>
                
                <div className="setting-group">
                  <div className="setting-item">
                    <label>Username</label>
                    <span className="setting-value">@{user.username}</span>
                  </div>
                  <div className="setting-item">
                    <label>Email</label>
                    <span className="setting-value">{user.email}</span>
                  </div>
                  <div className="setting-item">
                    <label>Member Since</label>
                    <span className="setting-value">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="setting-item">
                    <label>Credits</label>
                    <span className="setting-value">{user.credits || 0}</span>
                  </div>
                </div>

                <div className="setting-group">
                  <h3>Account Actions</h3>
                  <div className="action-buttons">
                    <button className="action-btn secondary">
                      Change Password
                    </button>
                    <button className="action-btn secondary">
                      Download Data
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                
                <div className="setting-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>Email Notifications</label>
                      <p>Receive important updates via email</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>Task Updates</label>
                      <p>Get notified when tasks are assigned or completed</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.taskUpdates}
                        onChange={() => handleNotificationChange('taskUpdates')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>Weekly Digest</label>
                      <p>Weekly summary of your activity and opportunities</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.weeklyDigest}
                        onChange={() => handleNotificationChange('weeklyDigest')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>Marketing Emails</label>
                      <p>Receive news and updates about Nova</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.marketingEmails}
                        onChange={() => handleNotificationChange('marketingEmails')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="settings-section">
                <h2>Privacy Settings</h2>
                
                <div className="setting-group">
                  <div className="select-item">
                    <label>Profile Visibility</label>
                    <p>Control who can see your profile</p>
                    <select 
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="members">Members Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>Show Email</label>
                      <p>Display your email address on your profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showEmail}
                        onChange={() => handlePrivacyChange('showEmail', !settings.privacy.showEmail)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>Show Last Seen</label>
                      <p>Display when you were last active</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showLastSeen}
                        onChange={() => handlePrivacyChange('showLastSeen', !settings.privacy.showLastSeen)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h2>Preferences</h2>
                
                <div className="setting-group">
                  <div className="select-item">
                    <label>Theme</label>
                    <p>Choose your preferred color scheme</p>
                    <select 
                      value={settings.preferences.theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="select-item">
                    <label>Language</label>
                    <p>Select your preferred language</p>
                    <select 
                      value={settings.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className="select-item">
                    <label>Timezone</label>
                    <p>Set your local timezone</p>
                    <select 
                      value={settings.preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="settings-actions">
              <button 
                className="save-settings-btn"
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
