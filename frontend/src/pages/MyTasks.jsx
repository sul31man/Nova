import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './MyTasks.css'

export default function MyTasks() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('assigned')
  const [tasks, setTasks] = useState({
    assigned: [],
    completed: [],
    created: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMyTasks()
    }
  }, [user])

  const fetchMyTasks = async () => {
    setLoading(true)
    try {
      // TODO: Implement API calls to fetch user's tasks
      // For now, using mock data
      setTimeout(() => {
        setTasks({
          assigned: [
            {
              id: 1,
              title: "Implement user authentication",
              description: "Add JWT-based authentication system to the Nova platform",
              difficulty: "intermediate",
              estimated_hours: "8-12 hours",
              reward_credits: 500,
              status: "in_progress",
              deadline: "2024-02-15",
              project_title: "Nova Authentication System"
            },
            {
              id: 2,
              title: "Design landing page mockups",
              description: "Create responsive design mockups for the new landing page",
              difficulty: "beginner",
              estimated_hours: "4-6 hours",
              reward_credits: 250,
              status: "pending",
              deadline: "2024-02-20",
              project_title: "Website Redesign"
            }
          ],
          completed: [
            {
              id: 3,
              title: "Set up database schema",
              description: "Design and implement the initial database structure",
              difficulty: "intermediate",
              estimated_hours: "6-8 hours",
              reward_credits: 400,
              status: "completed",
              completed_date: "2024-01-25",
              project_title: "Nova Backend Development"
            }
          ],
          created: [
            {
              id: 4,
              title: "Build mobile app prototype",
              description: "Create a React Native prototype for the Nova mobile app",
              difficulty: "advanced",
              estimated_hours: "20-30 hours",
              reward_credits: 1000,
              status: "available",
              applicants_count: 3,
              created_date: "2024-01-30",
              project_title: "Nova Mobile App"
            }
          ]
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4ade80'
      case 'in_progress': return '#3b82f6'
      case 'pending': return '#f59e0b'
      case 'available': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'in_progress': return 'In Progress'
      case 'pending': return 'Pending Start'
      case 'available': return 'Available'
      default: return status
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#4ade80'
      case 'intermediate': return '#f59e0b'
      case 'advanced': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (!user) {
    return (
      <div className="my-tasks-container">
        <div className="my-tasks-content">
          <h1>Access Denied</h1>
          <p>You need to be logged in to view your tasks.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-tasks-container">
      <div className="my-tasks-content">
        <div className="my-tasks-header">
          <h1 className="my-tasks-title">My Tasks</h1>
          <p className="my-tasks-subtitle">Manage your assignments and track your progress</p>
          
          <div className="tasks-stats">
            <div className="stat-card">
              <span className="stat-number">{tasks.assigned.length}</span>
              <span className="stat-label">Active Tasks</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{tasks.completed.length}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{tasks.created.length}</span>
              <span className="stat-label">Created</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{user.credits || 0}</span>
              <span className="stat-label">Total Credits</span>
            </div>
          </div>
        </div>

        <div className="tasks-tabs">
          <button 
            className={`tab-button ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            Assigned Tasks ({tasks.assigned.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({tasks.completed.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            Created by Me ({tasks.created.length})
          </button>
        </div>

        <div className="tasks-content">
          {loading ? (
            <div className="loading-message">Loading your tasks...</div>
          ) : (
            <div className="tasks-grid">
              {tasks[activeTab].length > 0 ? (
                tasks[activeTab].map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-badges">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(task.status) }}
                        >
                          {getStatusText(task.status)}
                        </span>
                        <span 
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(task.difficulty) }}
                        >
                          {task.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="task-description">{task.description}</p>
                    
                    <div className="task-meta">
                      <div className="task-project">
                        <strong>Project:</strong> {task.project_title}
                      </div>
                      <div className="task-details">
                        <span><strong>Time:</strong> {task.estimated_hours}</span>
                        <span><strong>Credits:</strong> {task.reward_credits}</span>
                      </div>
                    </div>

                    {activeTab === 'assigned' && (
                      <div className="task-deadline">
                        <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    )}

                    {activeTab === 'completed' && (
                      <div className="task-completed">
                        <strong>Completed:</strong> {new Date(task.completed_date).toLocaleDateString()}
                      </div>
                    )}

                    {activeTab === 'created' && (
                      <div className="task-created">
                        <div><strong>Created:</strong> {new Date(task.created_date).toLocaleDateString()}</div>
                        <div><strong>Applicants:</strong> {task.applicants_count}</div>
                      </div>
                    )}

                    <div className="task-actions">
                      {activeTab === 'assigned' && (
                        <>
                          {task.status === 'pending' && (
                            <button className="action-btn primary">Start Task</button>
                          )}
                          {task.status === 'in_progress' && (
                            <button className="action-btn success">Mark Complete</button>
                          )}
                          <button className="action-btn secondary">View Details</button>
                        </>
                      )}

                      {activeTab === 'completed' && (
                        <button className="action-btn secondary">View Details</button>
                      )}

                      {activeTab === 'created' && (
                        <>
                          <button className="action-btn secondary">View Applicants</button>
                          <button className="action-btn secondary">Edit Task</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No {activeTab} tasks</h3>
                  <p>
                    {activeTab === 'assigned' && "You don't have any assigned tasks yet. Browse the marketplace to find opportunities!"}
                    {activeTab === 'completed' && "You haven't completed any tasks yet. Start working on your assigned tasks!"}
                    {activeTab === 'created' && "You haven't created any tasks yet. Submit a project to generate tasks!"}
                  </p>
                  {activeTab === 'assigned' && (
                    <button className="action-btn primary">Browse Marketplace</button>
                  )}
                  {activeTab === 'created' && (
                    <button className="action-btn primary">Create Project</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
