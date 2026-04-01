import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '.75rem', marginBottom: 6 };
const sevColor = { critical: '#ef4444', major: '#f59e0b', minor: '#3b82f6', nit: '#888' };
const stBadge = { pending: { c: '#facc15', bg: '#1c1917' }, approved: { c: '#22c55e', bg: '#052e16' }, rejected: { c: '#ef4444', bg: '#1c0a0a' } };

export default function RunsPage({ runId, onBack }) {
  const [runs, setRuns] = useState([]);
  const [detail, setDetail] = useState(null);

  useEffect(() => { api('/runs?limit=50').then(setRuns); }, []);
  useEffect(() => { if (runId) api(`/runs/${runId}`).then(setDetail); }, [runId]);

  if (detail) {
    return (
      <div>
        <button onClick={() => { setDetail(null); onBack?.(); }} style={{ fontSize: 12, color: '#facc15', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}>← Back</button>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Run #{detail.run_number}</h2>
        <div style={{ fontSize: 12, color: '#666', marginBottom: '1rem' }}>{detail.mode} · {new Date(detail.created_at).toLocaleString()}</div>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: '.75rem' }}>Findings ({detail.findings?.length || 0})</h3>
        {(detail.findings || []).map(f => {
          const st = stBadge[f.status] || stBadge.pending;
          return (
            <div key={f.id} style={{ ...card, borderLeft: `3px solid ${sevColor[f.severity] || '#888'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{f.title}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: st.bg, color: st.c }}>{f.status}</span>
              </div>
              <div style={{ fontSize: 11, color: '#555' }}>{f.category} · {f.severity} · {Math.round(f.confidence * 100)}%</div>
            </div>
          );
        })}

        {detail.actions?.length > 0 && (
          <>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: '.75rem', marginTop: '1rem' }}>Log ({detail.actions.length})</h3>
            <div style={{ ...card, maxHeight: 300, overflowY: 'auto' }}>
              {detail.actions.map(a => (
                <div key={a.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #1e1e2a' }}>
                  <div style={{ fontSize: 10, color: '#555' }}>{new Date(a.created_at).toLocaleTimeString()} · <span style={{ color: '#facc15' }}>{a.category}</span></div>
                  <div style={{ fontSize: 12, color: '#ccc' }}>{a.description}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem', color: '#facc15' }}>All Runs</h2>
      {runs.length === 0
        ? <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No runs yet.</div>
        : runs.map(r => (
          <div key={r.id} style={{ ...card, cursor: 'pointer' }} onClick={() => api(`/runs/${r.id}`).then(setDetail)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>#{r.run_number}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: r.status === 'completed' ? '#052e16' : '#1c1917', color: r.status === 'completed' ? '#22c55e' : '#facc15' }}>{r.status}</span>
            </div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{r.mode} · {new Date(r.created_at).toLocaleDateString()}</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
              <span>{r.finding_count} findings</span>
              <span style={{ color: '#22c55e' }}>{r.approved_count}✓</span>
              <span style={{ color: '#ef4444' }}>{r.rejected_count}✗</span>
              <span style={{ color: '#facc15' }}>{r.pending_count} pending</span>
            </div>
          </div>
        ))
      }
    </div>
  );
}
