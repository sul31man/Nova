import React from 'react'
import ProjectIDE from '../components/ProjectIDE'
import { NavLink } from 'react-router-dom'
import './Education.css'

export default function IDEStandalone() {
  const sampleProject = {
    title: 'Morphic IDE • Scratchpad (Python)',
    description: 'A lightweight workspace to experiment and build. Use the Step Guide on the right or ignore it and explore.',
    acceptance_criteria: [
      'Print a greeting to the console',
      'Define a function that returns a value',
      'Write a small loop that prints numbers 1..5'
    ]
  }

  return (
    <div className="education-container">
      <div className="ide-header-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <NavLink to="/morphic-ide" className="exit-ide-btn">← Back to Morphic IDE</NavLink>
        <h2 style={{ margin: 0 }}>Morphic IDE</h2>
      </div>
      <ProjectIDE project={sampleProject} onComplete={() => alert('🎉 Nice! Try extending your scratchpad.')} />
    </div>
  )
}

