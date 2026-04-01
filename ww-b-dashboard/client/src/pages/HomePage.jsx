import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '.75rem', marginBottom: 6, cursor: 'pointer' };
const metric = { background: '#0d0d14', borderRadius: 8, padding: '.75rem', textAlign: 'center' };

export default function HomePage({ go }) {
  const [stats, setStats] = useState(null);
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    Promise.all([api('/stats'), api('/runs?limit=5')])
      .then(([s, r]) => { setStats(s); setRuns(r); });
  }, []);

  if (!stats) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem', color: '#facc15' }}>Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1rem' }}>
        <div style={metric}>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Pending</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#facc15' }}>{stats.pending}</div>
        </div>
        <div style={metric}>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Approved</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{stats.approved}</div>
        </div>
        <div style={metric}>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Rejected</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{stats.rejected}</div>
        </div>
      </div>

      {stats.commands > 0 && (
        <div style={{ ...metric, marginBottom: '1rem', background: '#1c1917', border: '1px solid rgba(250,204,21,0.2)' }}>
          <span style={{ fontSize: 12, color: '#facc15' }}>{stats.commands} pending command(s)</span>
        </div>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: '.75rem' }}>Recent Runs</h3>
      {runs.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#666', cursor: 'default' }}>
          <p style={{ fontSize: 12 }}>No runs yet. WW-B will push findings here.</p>
        </div>
      ) : runs.map(r => (
        <div key={r.id} style={card} onClick={() => go('runs', r.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Run #{r.run_number}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
              background: r.status === 'completed' ? '#052e16' : '#1c1917',
              color: r.status === 'completed' ? '#22c55e' : '#facc15',
            }}>{r.status}</span>
          </div>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{r.mode} · {new Date(r.created_at).toLocaleDateString()}</div>
          <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
            <span style={{ color: '#facc15' }}>{r.pending_count} pending</span>
            <span style={{ color: '#22c55e' }}>{r.approved_count}✓</span>
            <span style={{ color: '#ef4444' }}>{r.rejected_count}✗</span>
          </div>
        </div>
      ))}
    </div>
  );
}
