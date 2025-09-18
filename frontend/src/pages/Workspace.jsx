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
  const [tier, setTier] = useState('medium')
  const [view, setView] = useState('editor')
  const [chat, setChat] = useState([])
  const [input, setInput] = useState('')

  const lsKey = useMemo(() => workspace ? `nova_ws_${workspace.id}` : null, [workspace])

  // Load any locally saved edits for this workspace
  const applyLocalEdits = (baseFiles, keyOverride) => {
    try {
      const key = keyOverride || lsKey
      if (!key) return baseFiles
      const raw = localStorage.getItem(key)
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
        const initialFiles = data.files || {}
        const key = data.workspace ? `nova_ws_${data.workspace.id}` : null
        const merged = applyLocalEdits(initialFiles, key)
        setWorkspace(data.workspace)
        setFiles(merged)
        setOriginalFiles(initialFiles)
        const first = Object.keys(merged)[0]
        setActivePath(first || '')
        setChat([])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    create()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, token])

  // Update tier and view when workspace changes
  useEffect(() => {
    if (!workspace) return
    setTier(workspace.tier || 'medium')
    const panes = Array.isArray(workspace?.ui_config?.panes) ? [...workspace.ui_config.panes] : ['editor']
    if (!panes.includes('ai')) panes.push('ai')
    const unique = Array.from(new Set(panes))
    const def = workspace?.ui_config?.default_open || 'editor'
    setView(unique.includes(def) ? def : unique[0])
  }, [workspace])

  const panes = useMemo(() => {
    const base = Array.isArray(workspace?.ui_config?.panes)
      ? [...workspace.ui_config.panes]
      : ['editor', 'tests', 'logs']
    if (!base.includes('ai')) base.push('ai')
    return Array.from(new Set(base))
  }, [workspace])

  const reloadForTier = async (newTier) => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tasks/${taskId}/workspace`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: 'software', tier: newTier })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to switch level')
      const key = data.workspace ? `nova_ws_${data.workspace.id}` : null
      const initialFiles = data.files || {}
      const merged = applyLocalEdits(initialFiles, key)
      setWorkspace(data.workspace)
      setFiles(merged)
      setOriginalFiles(initialFiles)
      const first = Object.keys(merged)[0]
      setActivePath(first || '')
      setChat([])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid #000', borderRadius: 999, overflow: 'hidden' }}>
            {['low','medium','high'].map((level) => (
              <button
                key={level}
                onClick={() => { setTier(level); reloadForTier(level) }}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: 12,
                  background: tier === level ? '#000' : '#fff',
                  color: tier === level ? '#fff' : '#000',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title={`Switch to ${level} abstraction`}
              >{level}</button>
            ))}
          </div>
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

      {/* Primary panel (morphic) */}
      <div style={{ gridArea: 'code', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Tabs derived from ui_config */}
        <div style={{ padding: '6px 8px', borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
          {panes.map((pane) => (
            <button
              key={pane}
              onClick={() => setView(pane)}
              style={{
                border: '1px solid #000',
                padding: '4px 10px',
                background: view === pane ? '#000' : '#fff',
                color: view === pane ? '#fff' : '#000',
                borderRadius: 6,
                fontSize: 12
              }}
            >{pane.toUpperCase()}</button>
          ))}
        </div>
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
        {view === 'editor' && (
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
        )}
        {view === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
              <h4 style={{ marginTop: 0 }}>Assistant</h4>
              <div style={{ marginBottom: 12, color: '#444' }}>
                {(files['prompts.md'] || files['README.md']) && (
                  <details>
                    <summary>Template guidance</summary>
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 12 }}>
                      {files['prompts.md'] || files['README.md']}
                    </pre>
                  </details>
                )}
              </div>
              <div>
                {chat.map((c, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div><strong>You:</strong> {c.user}</div>
                    {c.tips && c.tips.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <strong>Assistant:</strong>
                        <ul style={{ margin: '6px 0 0 18px' }}>
                          {c.tips.map((t, idx) => <li key={idx}>{t}</li>)}
                        </ul>
                      </div>
                    )}
                    {c.patch && (
                      <div style={{ marginTop: 6 }}>
                        <button
                          onClick={() => {
                            const p = c.patch
                            const updated = { ...files, [p.path]: p.content }
                            setFiles(updated)
                            saveLocal(p.path, p.content)
                            if (activePath !== p.path) setActivePath(p.path)
                          }}
                          style={{ border: '1px solid #000', padding: '4px 8px', background: '#fff' }}
                        >Apply Suggested Patch ({c.patch.path})</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!input.trim()) return
                const userMsg = input
                setInput('')
                try {
                  const res = await fetch(`/api/workspaces/${taskId}/assist`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: userMsg, tier, files })
                  })
                  const data = await res.json()
                  const entry = { user: userMsg, tips: data?.response?.tips || [], patch: data?.patch || null }
                  setChat((prev) => [...prev, entry])
                } catch (err) {
                  setChat((prev) => [...prev, { user: userMsg, tips: ['Assistant unavailable.'] }])
                }
              }}
              style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #eee' }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for help or request a change (e.g., implement solve)"
                style={{ flex: 1, padding: '8px 10px', border: '1px solid #000', borderRadius: 6 }}
              />
              <button type="submit" style={{ border: '1px solid #000', padding: '8px 14px', background: '#000', color: '#fff', borderRadius: 6 }}>Send</button>
            </form>
          </div>
        )}
        {view === 'tests' && (
          <div style={{ padding: 12 }}>
            <h4 style={{ marginTop: 0 }}>Tests</h4>
            {Object.entries(files).filter(([p]) => p.toLowerCase().includes('test')).map(([p, content]) => (
              <details key={p} open style={{ marginBottom: 8 }}>
                <summary>{p}</summary>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 12 }}>{content}</pre>
              </details>
            ))}
            {Object.keys(files).filter(p => p.toLowerCase().includes('test')).length === 0 && (
              <p>No tests included in this template.</p>
            )}
          </div>
        )}
        {view === 'logs' && (
          <div style={{ padding: 12 }}>
            <h4 style={{ marginTop: 0 }}>Logs</h4>
            <p>Runner not attached yet. Execution output will appear here once enabled.</p>
          </div>
        )}
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
