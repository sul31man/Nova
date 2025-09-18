import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './IDEChatbot.css'

export default function IDEChatbot({ project, currentStep, currentCode, activeFile, isOpen, onToggle }) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your coding assistant. Ask me anything about your project, the current step, or if you're stuck with your code! 😊",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      // Prepare context for the AI
      const context = {
        project: project,
        current_step: currentStep,
        current_code: currentCode,
        file_name: activeFile
      }

      const response = await fetch('/api/education/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputText,
          context: context
        })
      })

      const data = await response.json()

      if (response.ok) {
        const aiMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble right now. Try asking again or use the hint button for help!",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickQuestions = [
    "What should I do next?",
    "I'm getting an error, can you help?",
    "How do I write a function?",
    "Can you explain this step?",
    "I'm stuck, what's wrong?"
  ]

  const askQuickQuestion = (question) => {
    setInputText(question)
  }

  if (!isOpen) {
    return (
      <div className="chatbot-toggle">
        <button className="chatbot-toggle-btn" onClick={onToggle}>
          💬 Ask AI Helper
        </button>
      </div>
    )
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <span className="chatbot-icon">🤖</span>
          <h4>AI Learning Assistant</h4>
        </div>
        <button className="chatbot-close" onClick={onToggle}>×</button>
      </div>

      <div className="chatbot-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="quick-questions">
          <p className="quick-questions-title">Quick questions:</p>
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              className="quick-question-btn"
              onClick={() => askQuickQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <div className="chatbot-input">
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your code..."
            rows="2"
            disabled={isLoading || !user}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputText.trim() || isLoading || !user}
            className="send-btn"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        {!user && (
          <p className="chat-login-hint">Sign in to chat with the AI assistant</p>
        )}
      </div>
    </div>
  )
}
