import React, { useEffect, useMemo, useState } from 'react'
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
  const [originalFiles, setOriginalFiles] = useState({})
  const [activePath, setActivePath] = useState('')

  const lsKey = useMemo(() => workspace ? `nova_ws_${workspace.id}` : null, [workspace])

  // Load any locally saved edits for this workspace
  const applyLocalEdits = (baseFiles) => {
    try {
      if (!lsKey) return baseFiles
      const raw = localStorage.getItem(lsKey)
      if (!raw) return baseFiles
      const overrides = JSON.parse(raw)
      const merged = { ...baseFiles }
      Object.entries(overrides).forEach(([p, content]) => {
        merged[p] = content
      })
      return merged
    } catch {
      return baseFiles
    }
  }

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
        const initialFiles = data.files || {}
        const merged = applyLocalEdits(initialFiles)
        setFiles(merged)
        setOriginalFiles(initialFiles)
        const first = Object.keys(merged)[0]
        setActivePath(first || '')
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    create()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, token, lsKey])

  const saveLocal = (path, content) => {
    try {
      if (!lsKey) return
      const raw = localStorage.getItem(lsKey)
      const data = raw ? JSON.parse(raw) : {}
      data[path] = content
      localStorage.setItem(lsKey, JSON.stringify(data))
    } catch {}
  }

  if (!token) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Sign in required</h2>
        <p>You must be signed in to open a workspace.</p>
      </div>
    )
  }

  const editor = (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateAreas: `'head head' 'tree code' 'foot foot'`,
      height: 'calc(100vh - 4rem)'
    }}>
      {/* Header */}
      <div style={{ gridArea: 'head', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1px solid #000', borderRadius: 8, marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 700 }}>Workspace • {(workspace && (workspace.name || workspace.template)) || ''}</div>
          <div style={{ color: '#555', fontSize: 12 }}>Runtime: {workspace?.runtime || ''} • Deps: {Array.isArray(workspace?.deps) ? workspace.deps.join(', ') : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button title="Evaluate (runner not attached yet)" disabled style={{ opacity: 0.6, cursor: 'not-allowed', border: '1px solid #000', padding: '0.5rem 0.75rem', background: '#fff' }}>Evaluate</button>
          <button onClick={() => navigate(-1)} style={{ border: '1px solid #000', padding: '0.5rem 0.75rem', background: '#fff' }}>Back</button>
        </div>
      </div>

      {/* File tree */}
      <div style={{ gridArea: 'tree', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto', padding: 8 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Files</div>
        {Object.keys(files).length === 0 && <div style={{ color: '#999' }}>No files</div>}
        {Object.keys(files).map((p) => (
          <div key={p} onClick={() => setActivePath(p)} style={{
            padding: '6px 8px',
            cursor: 'pointer',
            background: activePath === p ? '#000' : 'transparent',
            color: activePath === p ? '#fff' : '#000',
            borderRadius: 6,
            marginBottom: 4,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12
          }}>{p}</div>
        ))}
      </div>

      {/* Code editor */}
      <div style={{ gridArea: 'code', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: '#666' }}>{activePath || 'Select a file'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                if (!activePath) return
                navigator.clipboard.writeText(files[activePath] || '')
              }}
              style={{ border: '1px solid #000', padding: '4px 8px', background: '#fff' }}
            >Copy</button>
            <button
              onClick={() => {
                if (!activePath) return
                const original = originalFiles[activePath]
                if (original != null) {
                  const updated = { ...files, [activePath]: original }
                  setFiles(updated)
                  saveLocal(activePath, original)
                }
              }}
              style={{ border: '1px solid #000', padding: '4px 8px', background: '#fff' }}
            >Revert</button>
          </div>
        </div>
        <textarea
          value={activePath ? files[activePath] || '' : ''}
          onChange={(e) => {
            if (!activePath) return
            const updated = { ...files, [activePath]: e.target.value }
            setFiles(updated)
            saveLocal(activePath, e.target.value)
          }}
          placeholder="Select a file to edit"
          spellCheck={false}
          style={{
            flex: 1,
            width: '100%',
            border: 'none',
            outline: 'none',
            padding: 12,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            lineHeight: 1.5,
            resize: 'none',
            background: '#fafafa'
          }}
        />
      </div>

      {/* Footer */}
      <div style={{ gridArea: 'foot', marginTop: '0.75rem', color: '#555', fontSize: 12 }}>
        Evaluate command: <code>{workspace?.evaluate?.command || '—'}</code> • Changes auto-save to your browser only.
      </div>
    </div>
  )

  return (
    <div style={{ padding: '2rem', fontFamily: 'JetBrains Mono, monospace' }}>
      {loading && <p>Preparing the perfect environment…</p>}
      {error && (
        <div>
          <p style={{ color: '#dc2626' }}>{error}</p>
          {(error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('permission')) && (
            <p style={{ color: '#6b7280' }}>
              You must be the task owner or an accepted assignee to open this workspace.
            </p>
          )}
          <button onClick={() => navigate(-1)} style={{ border: '1px solid #000', padding: '0.5rem 1rem' }}>Back</button>
        </div>
      )}
      {!loading && !error && workspace && editor}
    </div>
  )
}
