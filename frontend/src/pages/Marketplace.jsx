import React, { useState, useEffect } from 'react'
import './Marketplace.css'

export default function Marketplace() {
  const [selectedTask, setSelectedTask] = useState(null)
  const [availableTasks, setAvailableTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
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


  const handleTaskSelect = (task) => {
    setSelectedTask(task)
  }

  const handleApplyToTask = () => {
    alert(`Applied to: ${selectedTask.title}`)
    setSelectedTask(null)
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-content">
        <h1 className="marketplace-title">Task Marketplace</h1>
        <p className="marketplace-subtitle">
          Browse engineering challenges broken down into actionable tasks. 
          Choose what interests you and contribute to building the future.
        </p>

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
              <h2 className="section-title">Available Tasks</h2>
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
      </div>
    </div>
  )
}
