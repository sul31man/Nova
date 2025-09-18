import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Workspace() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workspace, setWorkspace] = useState(null)
  const [files, setFiles] = useState({})

  useEffect(() => {
    if (!token) return
    const create = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/tasks/${taskId}/workspace`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to open workspace')
        setWorkspace(data.workspace)
        setFiles(data.files || {})
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    create()
  }, [taskId, token])

  if (!token) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Sign in required</h2>
        <p>You must be signed in to open a workspace.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'JetBrains Mono, monospace' }}>
      {loading && <p>Preparing the perfect environment…</p>}
      {error && (
        <div>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <button onClick={() => navigate(-1)} style={{ border: '1px solid #000', padding: '0.5rem 1rem' }}>Back</button>
        </div>
      )}
      {!loading && !error && workspace && (
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Workspace</h1>
          <div style={{ color: '#666', marginBottom: '1rem' }}>ID: {workspace.id}</div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3>Environment</h3>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: 1.8 }}>
                <li><strong>Template:</strong> {workspace.template}</li>
                <li><strong>Runtime:</strong> {workspace.runtime}</li>
                <li><strong>Dependencies:</strong> {workspace.deps.join(', ') || 'none'}</li>
                <li><strong>Evaluate:</strong> {workspace.evaluate?.command}</li>
              </ul>
              <p style={{ color: '#444' }}>This is a scaffolded preview. Next step: attach a sandbox runner (Docker/WebContainers) and wire Run/Evaluate actions.</p>
            </div>
            <div style={{ flex: 1 }}>
              <h3>Starter Files</h3>
              <div style={{ border: '1px solid #000', borderRadius: 6, overflow: 'hidden' }}>
                {Object.entries(files).map(([path, content]) => (
                  <details key={path} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <summary style={{ padding: '0.5rem 0.75rem', cursor: 'pointer' }}>{path}</summary>
                    <pre style={{ margin: 0, padding: '0.75rem', background: '#fafafa', whiteSpace: 'pre-wrap' }}>{content}</pre>
                  </details>
                ))}
                {Object.keys(files).length === 0 && (
                  <div style={{ padding: '0.75rem' }}>No files provided.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

