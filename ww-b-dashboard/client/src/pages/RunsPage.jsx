import React, { useState, useEffect } from 'react';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem' };
const SEV_COLORS = {
  critical: '#ef4444', major: '#f59e0b', minor: '#3b82f6', nit: '#888',
};
const STATUS_BADGE = {
  pending: { color: '#facc15', bg: '#1c1917' },
  approved: { color: '#22c55e', bg: '#052e16' },
  rejected: { color: '#ef4444', bg: '#1c0a0a' },
};

export default function RunsPage({ selectedRun }) {
  const [runs, setRuns] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/runs?limit=50').then(r => r.json()).then(r => { setRuns(r); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedRun) loadRun(selectedRun);
  }, [selectedRun]);

  async function loadRun(id) {
    const data = await fetch(`/api/runs/${id}`).then(r => r.json());
    setDetail(data);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>;

  // Detail view
  if (detail) {
    return (
      <div>
        <button onClick={() => setDetail(null)} style={{
          fontSize: 12, color: '#facc15', background: 'none', border: 'none',
          cursor: 'pointer', marginBottom: '1rem', padding: 0,
        }}>
          ← Back to runs
        </button>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Run #{detail.run_number}</h2>
        <div style={{ fontSize: 12, color: '#666', marginBottom: '1rem' }}>
          {detail.mode} · {new Date(detail.created_at).toLocaleString()}
          {detail.summary && <span> · {detail.summary}</span>}
        </div>

        {/* Findings */}
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.75rem' }}>
          Findings ({detail.findings?.length || 0})
        </h3>
        {(detail.findings || []).map(f => {
          const st = STATUS_BADGE[f.status] || STATUS_BADGE.pending;
          return (
            <div key={f.id} style={{ ...card, borderLeft: `3px solid ${SEV_COLORS[f.severity] || '#888'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{f.title}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                  background: st.bg, color: st.color,
                }}>{f.status}</span>
              </div>
              {f.description && f.description !== f.title && (
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{f.description.slice(0, 200)}</div>
              )}
              <div style={{ fontSize: 11, color: '#555' }}>
                {f.category} · {f.severity} · {Math.round(f.confidence * 100)}%
                {f.file && <span> · {f.file}</span>}
              </div>
              {f.review_note && (
                <div style={{ fontSize: 11, color: '#facc15', marginTop: 4, fontStyle: 'italic' }}>
                  Note: {f.review_note}
                </div>
              )}
            </div>
          );
        })}

        {/* Action log */}
        {detail.actions?.length > 0 && (<>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.75rem', marginTop: '1rem' }}>
            Action Log ({detail.actions.length})
          </h3>
          <div style={{ ...card, maxHeight: 300, overflowY: 'auto' }}>
            {detail.actions.map(a => (
              <div key={a.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #1e1e2a' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: '#555' }}>{new Date(a.created_at).toLocaleTimeString()}</span>
                  <span style={{ fontSize: 11, color: '#facc15', fontWeight: 500 }}>{a.category}</span>
                </div>
                <div style={{ fontSize: 12, color: '#ccc' }}>{a.description}</div>
              </div>
            ))}
          </div>
        </>)}
      </div>
    );
  }

  // List view
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem', color: '#facc15' }}>All Runs</h2>
      {runs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No runs yet.</div>
      ) : (
        runs.map(run => (
          <div key={run.id} style={{ ...card, cursor: 'pointer' }} onClick={() => loadRun(run.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>#{run.run_number}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
                background: run.status === 'completed' ? '#052e16' : '#1c1917',
                color: run.status === 'completed' ? '#22c55e' : '#facc15',
              }}>{run.status}</span>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              {run.mode} · {new Date(run.created_at).toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
              <span>{run.finding_count} findings</span>
              <span style={{ color: '#22c55e' }}>{run.approved_count} approved</span>
              <span style={{ color: '#ef4444' }}>{run.rejected_count} rejected</span>
              <span style={{ color: '#facc15' }}>{run.pending_count} pending</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
