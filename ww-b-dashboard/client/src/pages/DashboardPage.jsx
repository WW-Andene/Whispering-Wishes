import React, { useState, useEffect } from 'react';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem' };
const metric = { background: '#0d0d14', borderRadius: 8, padding: '0.75rem', textAlign: 'center', flex: 1 };

export default function DashboardPage({ onViewRun }) {
  const [stats, setStats] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/runs?limit=5').then(r => r.json()),
    ]).then(([s, r]) => { setStats(s); setRuns(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem', color: '#facc15' }}>Overview</h2>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: '1rem' }}>
          <div style={metric}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Total Findings</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.total}</div>
          </div>
          <div style={metric}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Pending</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#facc15' }}>{stats.pending}</div>
          </div>
          <div style={metric}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Approved</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{stats.approved}</div>
          </div>
          <div style={metric}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Rejected</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{stats.rejected}</div>
          </div>
        </div>
      )}

      {/* Recent runs */}
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.75rem' }}>Recent Runs</h3>
      {runs.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: 14, marginBottom: 4 }}>No runs yet</div>
          <div style={{ fontSize: 12 }}>WW-B will push findings here after its next audit.</div>
        </div>
      ) : (
        runs.map(run => (
          <div key={run.id} style={card} onClick={() => onViewRun(run.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Run #{run.run_number}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5,
                background: run.status === 'completed' ? '#052e16' : '#1c1917',
                color: run.status === 'completed' ? '#22c55e' : '#facc15',
              }}>
                {run.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
              {run.mode} · {new Date(run.created_at).toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              <span style={{ color: '#facc15' }}>{run.pending_count} pending</span>
              <span style={{ color: '#22c55e' }}>{run.approved_count} approved</span>
              <span style={{ color: '#ef4444' }}>{run.rejected_count} rejected</span>
            </div>
            {run.summary && <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>{run.summary}</div>}
          </div>
        ))
      )}
    </div>
  );
}
