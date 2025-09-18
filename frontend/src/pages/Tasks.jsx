import React, { useState } from 'react'
import './Tasks.css'

export default function Tasks() {
  const [engineeringProblem, setEngineeringProblem] = useState('')
  const [projectId, setProjectId] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [totalQuestionsSoFar, setTotalQuestionsSoFar] = useState(0)
  const [answers, setAnswers] = useState([])
  const [generatedTasks, setGeneratedTasks] = useState([])
  const [activeTab, setActiveTab] = useState('submit')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleProblemSubmit = async () => {
    if (!engineeringProblem.trim()) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: engineeringProblem
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create project')
      }
      
      const data = await response.json()
      setProjectId(data.project_id)
      setCurrentQuestion(data.current_question)
      setTotalQuestionsSoFar(data.total_questions_so_far)
      setIsProcessing(false)
      
    } catch (err) {
      setError('Failed to start AI analysis. Please try again.')
      setIsProcessing(false)
      console.error('Error creating project:', err)
    }
  }

  const handleAnswerSubmit = async (answer) => {
    if (!answer.trim() || !currentQuestion || !projectId) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          answer: answer
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }
      
      const data = await response.json()
      
      // Add this answer to our answers array
      const newAnswer = {
        question_text: currentQuestion.question_text,
        answer_text: answer
      }
      setAnswers(prev => [...prev, newAnswer])
      
      if (data.all_answered) {
        // Sufficient context gathered, generate tasks
        await generateTasks()
      } else {
        // AI generated next adaptive question
        setCurrentQuestion(data.next_question)
        setTotalQuestionsSoFar(data.total_questions_so_far)
      }
      
      setIsProcessing(false)
      
    } catch (err) {
      setError('Failed to submit answer. Please try again.')
      setIsProcessing(false)
      console.error('Error submitting answer:', err)
    }
  }

  const generateTasks = async () => {
    if (!projectId) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate tasks')
      }
      
      const data = await response.json()
      setGeneratedTasks(data.tasks)
      setCurrentQuestion(null) // Clear current question
      setIsProcessing(false)
      
    } catch (err) {
      setError('Failed to generate tasks. Please try again.')
      setIsProcessing(false)
      console.error('Error generating tasks:', err)
    }
  }

  const resetProcess = () => {
    setEngineeringProblem('')
    setProjectId(null)
    setCurrentQuestion(null)
    setTotalQuestionsSoFar(0)
    setAnswers([])
    setGeneratedTasks([])
    setError(null)
  }

  return (
    <div className="tasks-container">
      <div className="tasks-content">
        <h1 className="tasks-title">Task Decomposition Engine</h1>
        <p className="tasks-subtitle">
          Transform complex engineering problems into actionable tasks through AI-guided analysis
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="tab-navigation">
          <button 
            className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Submit Problem
          </button>
          <button 
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Tasks
          </button>
        </div>

        {activeTab === 'submit' && (
          <div className="submit-section">
            {!currentQuestion && generatedTasks.length === 0 && (
              <div className="problem-input-section">
                <h2 className="section-title">Describe Your Engineering Problem</h2>
                <textarea
                  className="problem-textarea"
                  placeholder="e.g., We need a sustainable water purification system for a rural community of 500 people with limited electricity access..."
                  value={engineeringProblem}
                  onChange={(e) => setEngineeringProblem(e.target.value)}
                  rows={6}
                />
                <button 
                  className="submit-button"
                  onClick={handleProblemSubmit}
                  disabled={!engineeringProblem.trim() || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Start AI Analysis'}
                </button>
              </div>
            )}

            {currentQuestion && (
              <div className="ai-questioning-section">
                <h2 className="section-title">AI Analysis in Progress</h2>
                <div className="progress-indicator">
                  Question {totalQuestionsSoFar} (Adaptive AI Questioning)
                </div>
                <div className="question-card">
                  <h3 className="ai-question">{currentQuestion.question_text}</h3>
                  <textarea
                    className="answer-textarea"
                    placeholder="Your answer..."
                    rows={4}
                  />
                  <button 
                    className="answer-button"
                    onClick={() => {
                      const textarea = document.querySelector('.answer-textarea')
                      if (textarea.value.trim()) {
                        handleAnswerSubmit(textarea.value)
                        textarea.value = ''
                      }
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Submit Answer'}
                  </button>
                </div>
                
                {answers.length > 0 && (
                  <div className="answered-questions">
                    <h4>Previous Answers:</h4>
                    {answers.map((answer, index) => (
                      <div key={index} className="answered-item">
                        <strong>Q: {answer.question_text}</strong>
                        <p>A: {answer.answer_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {generatedTasks.length > 0 && (
              <div className="generated-tasks-section">
                <h2 className="section-title">Generated Tasks</h2>
                <p className="tasks-intro">
                  Based on your problem and answers, here are the decomposed tasks ready for the marketplace:
                </p>
                
                <div className="tasks-list">
                  {generatedTasks.map(task => (
                    <div key={task.id} className="generated-task-card">
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
                          <span className="meta-label">Skills:</span>
                          <span>{task.skills.join(', ')}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Reward:</span>
                          <span>{task.reward_credits} credits</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="task-actions">
                  <button className="publish-button">
                    Publish Tasks to Marketplace
                  </button>
                  <button className="reset-button" onClick={resetProcess}>
                    Start New Problem
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="browse-section">
            <h2 className="section-title">Browse Available Tasks</h2>
            <p className="browse-description">
              Looking for tasks to work on? Check out the <a href="/marketplace" className="marketplace-link">Task Marketplace</a> where all decomposed engineering problems await contributors.
            </p>
            <div className="browse-stats">
              <div className="stat-item">
                <div className="stat-number">127</div>
                <div className="stat-label">Active Tasks</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">23</div>
                <div className="stat-label">Problems Solved</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">456</div>
                <div className="stat-label">Contributors</div>
              </div>
            </div>
            <button 
              className="browse-marketplace-button"
              onClick={() => window.location.href = '/marketplace'}
            >
              Go to Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


