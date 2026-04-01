import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '.75rem', marginBottom: 6 };

export default function ReviewPage() {
  const [findings, setFindings] = useState([]);
  const [sel, setSel] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { api('/findings/pending').then(f => { setFindings(f); setLoaded(true); }); }, []);

  const review = async (id, status) => {
    await api(`/findings/${id}/review`, { status });
    setFindings(p => p.filter(f => f.id !== id));
    setSel(p => { const n = new Set(p); n.delete(id); return n; });
  };

  const bulk = async (status) => {
    if (!sel.size) return;
    await api('/findings/bulk-review', { ids: [...sel], status });
    setFindings(p => p.filter(f => !sel.has(f.id)));
    setSel(new Set());
  };

  const toggle = id => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selAll = () => sel.size === findings.length ? setSel(new Set()) : setSel(new Set(findings.map(f => f.id)));

  if (!loaded) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>;
  if (!findings.length) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}><h3 style={{ fontSize: 16, marginBottom: 8 }}>All clear</h3><p style={{ fontSize: 12 }}>No pending findings.</p></div>;

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '.75rem', color: '#facc15' }}>Review ({findings.length})</h2>

      {sel.size > 0 && (
        <div style={{ ...card, display: 'flex', gap: 8, alignItems: 'center', padding: '.5rem .75rem' }}>
          <span style={{ fontSize: 12, color: '#888', flex: 1 }}>{sel.size} selected</span>
          <button onClick={() => bulk('approved')} style={btnSm('#22c55e', '#052e16')}>Approve all</button>
          <button onClick={() => bulk('rejected')} style={btnSm('#ef4444', '#1c0a0a')}>Reject all</button>
        </div>
      )}

      <button onClick={selAll} style={{ fontSize: 11, color: '#666', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8 }}>
        {sel.size === findings.length ? 'Deselect all' : 'Select all'}
      </button>

      {findings.map(f => (
        <div key={f.id} style={{ ...card, borderLeft: `3px solid ${sel.has(f.id) ? '#facc15' : '#1e1e2a'}`, background: sel.has(f.id) ? '#14141e' : '#111118' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <input type="checkbox" checked={sel.has(f.id)} onChange={() => toggle(f.id)} style={{ accentColor: '#facc15' }} />
            <span style={sevBadge(f.severity)}>{f.severity}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{f.category}</span>
            <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>{Math.round(f.confidence * 100)}%</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{f.title}</div>
          {f.description && f.description !== f.title && <div style={{ fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 1.5 }}>{f.description.slice(0, 200)}</div>}
          {f.file && <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>File: {f.file}</div>}
          {f.old_value && <div style={diffOld}>- {f.old_value.slice(0, 150)}</div>}
          {f.new_value && <div style={diffNew}>+ {f.new_value.slice(0, 150)}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => review(f.id, 'approved')} style={btnSm('#22c55e', '#052e16')}>Approve</button>
            <button onClick={() => review(f.id, 'rejected')} style={btnSm('#ef4444', '#1c0a0a')}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const btnSm = (color, bg) => ({ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: bg, color });
const sevBadge = (sev) => ({
  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase',
  background: sev === 'critical' ? '#1c0a0a' : sev === 'major' ? '#1c1507' : '#0a1428',
  color: sev === 'critical' ? '#ef4444' : sev === 'major' ? '#f59e0b' : '#3b82f6',
});
const diffOld = { fontSize: 10, color: '#ef4444', background: '#1c0a0a', padding: '3px 6px', borderRadius: 4, marginBottom: 2, fontFamily: 'monospace', maxHeight: 40, overflow: 'hidden', whiteSpace: 'pre-wrap' };
const diffNew = { fontSize: 10, color: '#22c55e', background: '#052e16', padding: '3px 6px', borderRadius: 4, fontFamily: 'monospace', maxHeight: 40, overflow: 'hidden', whiteSpace: 'pre-wrap' };
