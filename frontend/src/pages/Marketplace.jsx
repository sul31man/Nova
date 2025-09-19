import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Marketplace.css'

export default function Marketplace() {
  const { user, token } = useAuth()
  const [selectedTask, setSelectedTask] = useState(null)
  const [availableTasks, setAvailableTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    difficulty: '',
    skills: '',
    min_credits: '',
    max_credits: ''
  })
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [applying, setApplying] = useState(false)

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams()
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty)
      if (filters.skills) queryParams.append('skills', filters.skills)
      if (filters.min_credits) queryParams.append('min_credits', filters.min_credits)
      if (filters.max_credits) queryParams.append('max_credits', filters.max_credits)
      
      const url = '/api/tasks' + (queryParams.toString() ? '?' + queryParams.toString() : '')
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      setAvailableTasks(data.tasks || [])
      setIsLoading(false)
    } catch (err) {
      setError('Failed to load tasks')
      setIsLoading(false)
      console.error('Error fetching tasks:', err)
    }
  }

  // Re-fetch tasks when filters change
  useEffect(() => {
    setIsLoading(true)
    fetchTasks()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      skills: '',
      min_credits: '',
      max_credits: ''
    })
  }


  const handleTaskSelect = (task) => {
    setSelectedTask(task)
  }

  const handleApplyToTask = () => {
    if (!user) {
      alert('Please sign in to apply for tasks')
      return
    }
    setShowApplicationModal(true)
  }

  const submitApplication = async () => {
    if (!selectedTask || !user) return
    
    setApplying(true)
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: applicationMessage
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Application submitted successfully!')
        setShowApplicationModal(false)
        setSelectedTask(null)
        setApplicationMessage('')
        // Refresh tasks to update applicant counts
        fetchTasks()
      } else {
        alert(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to task:', error)
      alert('Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-content">
        <h1 className="marketplace-title">Operation Marketplace</h1>
        <p className="marketplace-subtitle">
          Browse engineering challenges broken down into actionable tasks. 
          Choose what interests you and contribute to building the future.
        </p>

        {/* Filters Section */}
        <div className="filters-section">
          <h3>Filter Tasks</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Skills</label>
              <input
                type="text"
                placeholder="e.g., Python, React, Machine Learning"
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Min Credits</label>
              <input
                type="number"
                placeholder="0"
                value={filters.min_credits}
                onChange={(e) => handleFilterChange('min_credits', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Max Credits</label>
              <input
                type="number"
                placeholder="1000"
                value={filters.max_credits}
                onChange={(e) => handleFilterChange('max_credits', e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-message">
            Loading tasks...
          </div>
        ) : (
          <div className="marketplace-layout">
            <div className="task-list">
              <h2 className="section-title">Available Missions</h2>
            <div className="filter-section">
              <select className="filter-select">
                <option>All Difficulties</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <select className="filter-select">
                <option>All Skills</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Research</option>
                <option>Analysis</option>
              </select>
            </div>

            <div className="tasks-grid">
              {availableTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task-card ${selectedTask?.id === task.id ? 'selected' : ''}`}
                  onClick={() => handleTaskSelect(task)}
                >
                  <div className="task-header">
                    <h3 className="task-title">{task.title}</h3>
                    <span className={`difficulty-badge ${task.difficulty.toLowerCase()}`}>
                      {task.difficulty}
                    </span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <div className="meta-item">
                      <span className="meta-label">Time:</span>
                      <span>{task.estimated_hours}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Reward:</span>
                      <span className="reward">{task.reward_credits} credits</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Applicants:</span>
                      <span>{task.applicants_count || 0}</span>
                    </div>
                  </div>
                  <div className="task-skills">
                    {task.skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="task-posted">Posted {new Date(task.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedTask && (
            <div className="task-details">
              <h2 className="section-title">Task Details</h2>
              <div className="details-content">
                <h3>{selectedTask.title}</h3>
                <p className="details-description">{selectedTask.description}</p>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Difficulty:</strong> {selectedTask.difficulty}
                  </div>
                  <div className="detail-item">
                    <strong>Estimated Time:</strong> {selectedTask.estimated_hours}
                  </div>
                  <div className="detail-item">
                    <strong>Reward:</strong> {selectedTask.reward_credits} credits
                  </div>
                  <div className="detail-item">
                    <strong>Current Applicants:</strong> {selectedTask.applicants_count || 0}
                  </div>
                </div>

                <div className="required-skills">
                  <strong>Required Skills:</strong>
                  <div className="skills-list">
                    {selectedTask.skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <button className="apply-button" onClick={handleApplyToTask}>
                  Apply for This Task
                </button>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="modal-overlay" onClick={() => setShowApplicationModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Apply for Task</h3>
                <button className="modal-close" onClick={() => setShowApplicationModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <h4>{selectedTask?.title}</h4>
                <p>Tell the project creator why you're the right person for this task:</p>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Describe your relevant experience and why you're interested in this task..."
                  rows="4"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="modal-btn-secondary" 
                  onClick={() => setShowApplicationModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="modal-btn-primary" 
                  onClick={submitApplication}
                  disabled={applying}
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
