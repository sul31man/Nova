import React, { useState } from 'react'
import './Marketplace.css'

export default function Marketplace() {
  const [selectedTask, setSelectedTask] = useState(null)

  // Mock task data - in a real app this would come from your backend
  const availableTasks = [
    {
      id: 1,
      title: "Design Solar Panel Mounting System",
      description: "Create a lightweight, adjustable mounting system for residential solar panels that can adapt to different roof angles and materials.",
      difficulty: "Intermediate",
      estimatedHours: "8-12 hours",
      skills: ["Mechanical Design", "CAD", "Materials Engineering"],
      reward: "150 credits",
      posted: "2 hours ago",
      applicants: 3
    },
    {
      id: 2,
      title: "Develop Community Water Filtration Protocol",
      description: "Research and design a scalable water filtration system for rural communities using locally available materials.",
      difficulty: "Advanced",
      estimatedHours: "15-20 hours",
      skills: ["Chemical Engineering", "Research", "Documentation"],
      reward: "300 credits",
      posted: "5 hours ago",
      applicants: 7
    },
    {
      id: 3,
      title: "Optimize Traffic Light Algorithm",
      description: "Analyze current traffic patterns and propose an improved algorithm for traffic light timing in urban intersections.",
      difficulty: "Beginner",
      estimatedHours: "4-6 hours",
      skills: ["Data Analysis", "Algorithm Design", "Urban Planning"],
      reward: "100 credits",
      posted: "1 day ago",
      applicants: 12
    },
    {
      id: 4,
      title: "Create Emergency Shelter Framework",
      description: "Design a modular, rapid-deployment shelter system for disaster relief that can be assembled by non-specialists.",
      difficulty: "Advanced",
      estimatedHours: "20-25 hours",
      skills: ["Structural Engineering", "Disaster Response", "Modular Design"],
      reward: "400 credits",
      posted: "6 hours ago",
      applicants: 5
    }
  ]

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
                      <span>{task.estimatedHours}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Reward:</span>
                      <span className="reward">{task.reward}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Applicants:</span>
                      <span>{task.applicants}</span>
                    </div>
                  </div>
                  <div className="task-skills">
                    {task.skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="task-posted">Posted {task.posted}</div>
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
                    <strong>Estimated Time:</strong> {selectedTask.estimatedHours}
                  </div>
                  <div className="detail-item">
                    <strong>Reward:</strong> {selectedTask.reward}
                  </div>
                  <div className="detail-item">
                    <strong>Current Applicants:</strong> {selectedTask.applicants}
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
      </div>
    </div>
  )
}
