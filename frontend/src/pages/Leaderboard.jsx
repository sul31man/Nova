import React, { useEffect, useState } from 'react'
import './Profile.css'

export default function Leaderboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/leaderboard')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load leaderboard')
        setUsers(data.users || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1 className="profile-title">Nova Leaderboard</h1>
        <p className="profile-username" style={{ marginBottom: '1.5rem' }}>Ranked by missions completed and squads led</p>
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {!loading && !error && (
          <div className="applications-list">
            {users.map((u, idx) => (
              <div key={u.id} className="application-card">
                <div className="app-header" style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>#{idx + 1}</span>
                    <div className="profile-avatar-large" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.username} />
                      ) : (
                        <span>{(u.full_name || u.username || 'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.full_name || u.username}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Level: {u.status || '—'}</div>
                    </div>
                  </div>
                  <div className="app-meta" style={{ gap: '0.75rem' }}>
                    <span>Missions: {u.missions_completed || 0}</span>
                    <span>Squads Led: {u.squads_led || 0}</span>
                    <span>Credits: {u.credits || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
