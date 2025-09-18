import React, { useState } from 'react'
import './Tasks.css'

export default function Tasks() {
  const [engineeringProblem, setEngineeringProblem] = useState('')
  const [aiQuestions, setAiQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [answers, setAnswers] = useState({})
  const [generatedTasks, setGeneratedTasks] = useState([])
  const [activeTab, setActiveTab] = useState('submit')
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock AI questions based on engineering problem type
  const mockAiQuestions = [
    "What is the scale of this project? (Individual, Community, City-wide, Global)",
    "What resources are currently available for this project?",
    "What are the main constraints you're facing? (Budget, Time, Materials, Skills)",
    "Who is the target user or beneficiary of this solution?",
    "What similar solutions already exist, and why aren't they sufficient?",
    "What would success look like for this project?",
    "What are the potential risks or failure points?",
    "What timeline are you working with?"
  ]

  const handleProblemSubmit = () => {
    if (!engineeringProblem.trim()) return
    
    setIsProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      setAiQuestions(mockAiQuestions.slice(0, 5)) // Start with first 5 questions
      setCurrentQuestion(mockAiQuestions[0])
      setIsProcessing(false)
    }, 1000)
  }

  const handleAnswerSubmit = (answer) => {
    const updatedAnswers = { ...answers, [currentQuestion]: answer }
    setAnswers(updatedAnswers)
    
    const answeredQuestions = Object.keys(updatedAnswers).length
    const nextQuestionIndex = answeredQuestions
    
    if (nextQuestionIndex < aiQuestions.length) {
      setCurrentQuestion(aiQuestions[nextQuestionIndex])
    } else {
      // Generate tasks based on answers
      generateTasks(updatedAnswers)
    }
  }

  const generateTasks = (allAnswers) => {
    setIsProcessing(true)
    
    // Mock task generation based on answers
    setTimeout(() => {
      const mockTasks = [
        {
          id: 1,
          title: `Research Phase: ${engineeringProblem.split(' ').slice(0, 3).join(' ')}`,
          description: "Conduct comprehensive research on existing solutions, technologies, and methodologies.",
          estimatedHours: "8-12 hours",
          skills: ["Research", "Analysis", "Documentation"],
          difficulty: "Beginner"
        },
        {
          id: 2,
          title: `Design & Planning: System Architecture`,
          description: "Create detailed system design, specifications, and implementation roadmap.",
          estimatedHours: "15-20 hours",
          skills: ["System Design", "Planning", "Technical Writing"],
          difficulty: "Intermediate"
        },
        {
          id: 3,
          title: `Prototype Development`,
          description: "Build initial prototype or proof-of-concept based on research and design.",
          estimatedHours: "20-30 hours",
          skills: ["Programming", "Engineering", "Problem Solving"],
          difficulty: "Advanced"
        },
        {
          id: 4,
          title: `Testing & Validation`,
          description: "Test prototype, gather feedback, and validate solution effectiveness.",
          estimatedHours: "10-15 hours",
          skills: ["Testing", "Data Analysis", "User Research"],
          difficulty: "Intermediate"
        },
        {
          id: 5,
          title: `Documentation & Knowledge Transfer`,
          description: "Create comprehensive documentation and prepare for knowledge transfer.",
          estimatedHours: "6-10 hours",
          skills: ["Documentation", "Communication", "Training"],
          difficulty: "Beginner"
        }
      ]
      
      setGeneratedTasks(mockTasks)
      setIsProcessing(false)
    }, 2000)
  }

  const resetProcess = () => {
    setEngineeringProblem('')
    setAiQuestions([])
    setCurrentQuestion('')
    setAnswers({})
    setGeneratedTasks([])
  }

  return (
    <div className="tasks-container">
      <div className="tasks-content">
        <h1 className="tasks-title">Task Decomposition Engine</h1>
        <p className="tasks-subtitle">
          Transform complex engineering problems into actionable tasks through AI-guided analysis
        </p>

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
                  Question {Object.keys(answers).length + 1} of {aiQuestions.length}
                </div>
                <div className="question-card">
                  <h3 className="ai-question">{currentQuestion}</h3>
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
                  >
                    Submit Answer
                  </button>
                </div>
                
                {Object.keys(answers).length > 0 && (
                  <div className="answered-questions">
                    <h4>Previous Answers:</h4>
                    {Object.entries(answers).map(([question, answer], index) => (
                      <div key={index} className="answered-item">
                        <strong>Q: {question}</strong>
                        <p>A: {answer}</p>
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
                          <span>{task.estimatedHours}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Skills:</span>
                          <span>{task.skills.join(', ')}</span>
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


