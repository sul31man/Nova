import React, { useState, useEffect } from 'react'
import IDEChatbot from './IDEChatbot'
import './ProjectIDE.css'

export default function ProjectIDE({ project, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [files, setFiles] = useState({})
  const [activeFile, setActiveFile] = useState(null)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [stepCompleted, setStepCompleted] = useState({})
  const [showHint, setShowHint] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)

  // Initialize project files based on project type
  useEffect(() => {
    if (project) {
      const initialFiles = getInitialFiles(project)
      setFiles(initialFiles)
      setActiveFile(Object.keys(initialFiles)[0])
    }
  }, [project])

  const getInitialFiles = (project) => {
    // Create initial file structure based on project type
    const projectType = detectProjectType(project.title)
    
    switch (projectType) {
      case 'python':
        return {
          'main.py': '# Welcome to your Python project!\n# Follow the steps on the right to complete your task\n\nprint("Hello, Nova!")\n',
          'requirements.txt': '# Add your dependencies here\n',
          'README.md': `# ${project.title}\n\n${project.description}\n\n## Getting Started\nFollow the step-by-step guide to complete this project.`
        }
      case 'javascript':
        return {
          'index.js': '// Welcome to your JavaScript project!\n// Follow the steps on the right to complete your task\n\nconsole.log("Hello, Nova!");\n',
          'package.json': `{\n  "name": "${project.title.toLowerCase().replace(/\\s+/g, '-')}",\n  "version": "1.0.0",\n  "main": "index.js"\n}`,
          'README.md': `# ${project.title}\n\n${project.description}\n\n## Getting Started\nFollow the step-by-step guide to complete this project.`
        }
      case 'react':
        return {
          'App.jsx': 'import React from "react";\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello, Nova!</h1>\n      <p>Follow the steps to build your React app</p>\n    </div>\n  );\n}\n\nexport default App;',
          'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>Nova Project</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
          'README.md': `# ${project.title}\n\n${project.description}\n\n## Getting Started\nFollow the step-by-step guide to complete this project.`
        }
      default:
        return {
          'main.txt': `# ${project.title}\n\n${project.description}\n\nFollow the step-by-step guide to complete this project.`,
          'notes.md': '# Project Notes\n\nAdd your notes and observations here as you work through the project.'
        }
    }
  }

  const detectProjectType = (title) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('python') || titleLower.includes('ml') || titleLower.includes('ai')) return 'python'
    if (titleLower.includes('react') || titleLower.includes('frontend')) return 'react'
    if (titleLower.includes('javascript') || titleLower.includes('js') || titleLower.includes('node')) return 'javascript'
    return 'general'
  }

  const updateFile = (filename, content) => {
    setFiles(prev => ({
      ...prev,
      [filename]: content
    }))
  }

  const createNewFile = () => {
    const filename = prompt('Enter filename:')
    if (filename && !files[filename]) {
      setFiles(prev => ({
        ...prev,
        [filename]: ''
      }))
      setActiveFile(filename)
    }
  }

  const deleteFile = (filename) => {
    if (Object.keys(files).length <= 1) {
      alert('Cannot delete the last file')
      return
    }
    
    const newFiles = { ...files }
    delete newFiles[filename]
    setFiles(newFiles)
    
    if (activeFile === filename) {
      setActiveFile(Object.keys(newFiles)[0])
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput('Running...\n')
    
    try {
      // Simulate code execution (in a real implementation, this would call a backend service)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockOutput = generateMockOutput(activeFile, files[activeFile])
      setOutput(mockOutput)
      
      // Check if step is completed based on code content
      checkStepCompletion()
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const generateMockOutput = (filename, content) => {
    if (filename.endsWith('.py')) {
      if (content.includes('print(')) {
        const printMatches = content.match(/print\(['"`]([^'"`]*)['"`]\)/g)
        if (printMatches) {
          return printMatches.map(match => 
            match.replace(/print\(['"`]([^'"`]*)['"`]\)/, '$1')
          ).join('\n') + '\n\n✅ Code executed successfully!'
        }
      }
      return '✅ Python code executed successfully!'
    } else if (filename.endsWith('.js') || filename.endsWith('.jsx')) {
      if (content.includes('console.log(')) {
        const logMatches = content.match(/console\.log\(['"`]([^'"`]*)['"`]\)/g)
        if (logMatches) {
          return logMatches.map(match => 
            match.replace(/console\.log\(['"`]([^'"`]*)['"`]\)/, '$1')
          ).join('\n') + '\n\n✅ JavaScript executed successfully!'
        }
      }
      return '✅ JavaScript executed successfully!'
    }
    return '✅ File processed successfully!'
  }

  const checkStepCompletion = () => {
    // Simple completion check based on code content
    const content = files[activeFile] || ''
    const steps = project.acceptance_criteria || []
    
    if (steps[currentStep]) {
      const stepText = steps[currentStep].toLowerCase()
      const contentLower = content.toLowerCase()
      
      // Basic keyword matching for step completion
      const keywords = extractKeywords(stepText)
      const hasKeywords = keywords.some(keyword => contentLower.includes(keyword))
      
      if (hasKeywords && content.length > 50) { // Minimum content length
        setStepCompleted(prev => ({
          ...prev,
          [currentStep]: true
        }))
        
        if (currentStep < steps.length - 1) {
          setTimeout(() => {
            setCurrentStep(currentStep + 1)
          }, 1500)
        } else {
          // Project completed
          setTimeout(() => {
            if (onComplete) onComplete()
          }, 2000)
        }
      }
    }
  }

  const extractKeywords = (text) => {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
    return text
      .split(' ')
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 3) // Take first 3 meaningful words
  }

  const nextStep = () => {
    if (currentStep < (project.acceptance_criteria?.length || 1) - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!project) {
    return (
      <div className="ide-container">
        <div className="ide-placeholder">
          <h3>No project selected</h3>
          <p>Complete the education planner to start your first project</p>
        </div>
      </div>
    )
  }

  const steps = project.acceptance_criteria || []
  const currentStepText = steps[currentStep] || 'Complete the project'

  return (
    <div className="ide-container">
      {/* Header */}
      <div className="ide-header">
        <div className="ide-title">
          <h3>{project.title}</h3>
          <span className="step-counter">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <div className="ide-controls">
          <button 
            className="run-btn" 
            onClick={runCode} 
            disabled={isRunning || !activeFile}
          >
            {isRunning ? '⏳ Running...' : '▶️ Run'}
          </button>
        </div>
      </div>

      <div className="ide-body">
        {/* File Explorer */}
        <div className="ide-sidebar">
          <div className="sidebar-header">
            <h4>Files</h4>
            <button className="new-file-btn" onClick={createNewFile}>+</button>
          </div>
          <div className="file-list">
            {Object.keys(files).map(filename => (
              <div 
                key={filename}
                className={`file-item ${activeFile === filename ? 'active' : ''}`}
                onClick={() => setActiveFile(filename)}
              >
                <span className="file-name">{filename}</span>
                {Object.keys(files).length > 1 && (
                  <button 
                    className="delete-file-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFile(filename)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="ide-editor">
          {activeFile && (
            <>
              <div className="editor-header">
                <span className="editor-filename">{activeFile}</span>
              </div>
              <textarea
                className="code-editor"
                value={files[activeFile] || ''}
                onChange={(e) => updateFile(activeFile, e.target.value)}
                placeholder="Start coding..."
                spellCheck={false}
              />
            </>
          )}
        </div>

        {/* Step Guide */}
        <div className="ide-guide">
          <div className="guide-header">
            <h4>Step Guide</h4>
            <button 
              className="hint-btn"
              onClick={() => setShowHint(!showHint)}
            >
              💡 Hint
            </button>
          </div>
          
          <div className="current-step">
            <div className="step-indicator">
              <span className={`step-status ${stepCompleted[currentStep] ? 'completed' : ''}`}>
                {stepCompleted[currentStep] ? '✅' : '🎯'}
              </span>
            </div>
            <div className="step-content">
              <h5>Current Objective</h5>
              <p>{currentStepText}</p>
              
              {showHint && (
                <div className="hint-box">
                  <h6>💡 Hint</h6>
                  <p>{generateHint(currentStepText, activeFile)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="step-navigation">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="step-nav-btn"
            >
              ← Previous
            </button>
            <button 
              onClick={nextStep} 
              disabled={currentStep >= steps.length - 1}
              className="step-nav-btn"
            >
              Next →
            </button>
          </div>

          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${((currentStep + (stepCompleted[currentStep] ? 1 : 0)) / steps.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="ide-output">
        <div className="output-header">
          <h4>Output</h4>
        </div>
        <div className="output-content">
          <pre>{output || 'Click "Run" to execute your code...'}</pre>
        </div>
      </div>

      {/* AI Chatbot */}
      <IDEChatbot
        project={project}
        currentStep={steps[currentStep]}
        currentCode={files[activeFile] || ''}
        activeFile={activeFile}
        isOpen={chatbotOpen}
        onToggle={() => setChatbotOpen(!chatbotOpen)}
      />
    </div>
  )
}

function generateHint(stepText, filename) {
  const stepLower = stepText.toLowerCase()
  
  if (stepLower.includes('function') || stepLower.includes('def')) {
    return 'Try defining a function. In Python use "def function_name():" or in JavaScript use "function functionName() {}"'
  }
  if (stepLower.includes('variable')) {
    return 'Create a variable to store data. In Python: "variable_name = value", in JavaScript: "let variableName = value"'
  }
  if (stepLower.includes('print') || stepLower.includes('output')) {
    return 'Use print() in Python or console.log() in JavaScript to display output'
  }
  if (stepLower.includes('loop')) {
    return 'Use a for loop or while loop to repeat code. In Python: "for i in range(n):" or JavaScript: "for(let i = 0; i < n; i++)"'
  }
  if (stepLower.includes('import') || stepLower.includes('library')) {
    return 'Import libraries at the top of your file. In Python: "import library_name" or JavaScript: "const lib = require(\'library\')"'
  }
  
  return 'Break down the task into smaller steps. Focus on one requirement at a time and test your code frequently.'
}
