import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './UserProfile.css'

const UserProfile = () => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('[data-dropdown]')) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
  }

  const handleNavigation = (path) => {
    navigate(path)
    setDropdownOpen(false)
  }

  const getInitials = (name) => {
    if (!name) return user.username.charAt(0).toUpperCase()
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="user-profile" data-dropdown>
      <button 
        className="user-profile-button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="user-avatar">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} />
          ) : (
            <span>{getInitials(user.full_name)}</span>
          )}
        </div>
        <span className="user-name">
          {user.full_name || user.username}
        </span>
        <span className="dropdown-arrow">▾</span>
      </button>

      {dropdownOpen && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <div className="user-avatar-large">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} />
              ) : (
                <span>{getInitials(user.full_name)}</span>
              )}
            </div>
            <div className="user-info">
              <div className="user-display-name">
                {user.full_name || user.username}
              </div>
              <div className="user-username">@{user.username}</div>
              <div className="user-credits">{user.credits || 0} credits</div>
            </div>
          </div>

          <div className="user-dropdown-menu">
            <button className="dropdown-item" onClick={() => handleNavigation('/profile')}>
              <span>Profile</span>
            </button>
            <button className="dropdown-item" onClick={() => handleNavigation('/learning-path')}>
              <span>Learning Path</span>
            </button>
            <button className="dropdown-item" onClick={() => handleNavigation('/settings')}>
              <span>Settings</span>
            </button>
            <button className="dropdown-item" onClick={() => handleNavigation('/my-tasks')}>
              <span>My Tasks</span>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
