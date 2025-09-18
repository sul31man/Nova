import React, { useEffect, useState } from 'react'
import './Home.css'

export default function Home() {
  const [apiMessage, setApiMessage] = useState('...')
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    fetch('/api/hello')
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.json()
      })
      .then((data) => setApiMessage(data.message))
      .catch((error) => setApiError(error.message))
  }, [])

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="animated-title">
          <h1 className="nova-title">Nova</h1>
          <div className="title-cursor"></div>
        </div>
        
        <p className="landing-tagline">
          Making the most of the biological distributed network
        </p>
        
        <div className="landing-description">
          <p>Democratizing engineering through AI-human collaboration</p>
          <p>Where everybody builds, learns, and contributes</p>
        </div>
        
        <div className="api-status-minimal">
          <span className={`status-dot ${apiError ? 'offline' : 'online'}`}></span>
          System: {apiError ? 'Offline' : 'Online'}
        </div>
        
        <div className="landing-cta">
          <a href="/tasks" className="cta-button">Start Building</a>
          <a href="/marketplace" className="cta-button-secondary">Browse Tasks</a>
        </div>
      </div>
    </div>
  )
}