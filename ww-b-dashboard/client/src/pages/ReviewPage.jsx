import React, { useState, useEffect, useCallback } from 'react';

const SEV = {
  critical: { color: '#ef4444', bg: '#1c0a0a' },
  major: { color: '#f59e0b', bg: '#1c1507' },
  minor: { color: '#3b82f6', bg: '#0a1428' },
  nit: { color: '#888', bg: '#141414' },
};

const CAT_COLORS = {
  'banner-update': '#f59e0b', 'event-update': '#22c55e', 'new-event': '#22c55e',
  'new-character': '#a855f7', 'new-weapon': '#06b6d4', 'broken-url': '#ef4444',
  'audit': '#3b82f6', 'validation-error': '#ef4444',
  'scenario-critical': '#ef4444', 'scenario-major': '#f59e0b',
  'scenario-minor': '#3b82f6', 'scenario-nit': '#888',
};

export default function ReviewPage() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());

  const load = useCallback(() => {
    fetch('/api/findings/pending').then(r => r.json()).then(f => { setFindings(f); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function review(id, status) {
    await fetch(`/api/findings/${id}/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setFindings(prev => prev.filter(f => f.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  async function bulkReview(status) {
    if (!selected.size) return;
    await fetch('/api/findings/bulk-review', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], status }),
    });
    setFindings(prev => prev.filter(f => !selected.has(f.id)));
    setSelected(new Set());
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(f => f.id)));
  }

  const categories = [...new Set(findings.map(f => f.category))];
  const filtered = filter === 'all' ? findings : findings.filter(f => f.category === filter);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#facc15' }}>
          Review ({findings.length} pending)
        </h2>
      </div>

      {findings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>All clear</div>
          <div style={{ fontSize: 13 }}>No pending findings to review.</div>
        </div>
      ) : (<>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')} style={filterBtn(filter === 'all')}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={filterBtn(filter === c)}>{c}</button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div style={{
            display: 'flex', gap: 8, marginBottom: '0.75rem', padding: '0.5rem 0.75rem',
            background: '#111118', borderRadius: 8, border: '1px solid #1e1e2a', alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: '#888', flex: 1 }}>{selected.size} selected</span>
            <button onClick={() => bulkReview('approved')} style={actionBtn('#22c55e', '#052e16')}>Approve all</button>
            <button onClick={() => bulkReview('rejected')} style={actionBtn('#ef4444', '#1c0a0a')}>Reject all</button>
          </div>
        )}

        {/* Select all */}
        <button onClick={selectAll} style={{
          fontSize: 11, color: '#666', background: 'none', border: 'none', cursor: 'pointer',
          marginBottom: 8, padding: '2px 0',
        }}>
          {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
        </button>

        {/* Findings list */}
        {filtered.map(f => {
          const sev = SEV[f.severity] || SEV.minor;
          const catColor = CAT_COLORS[f.category] || '#888';
          return (
            <div key={f.id} style={{
              background: selected.has(f.id) ? '#14141e' : '#111118',
              border: `1px solid ${selected.has(f.id) ? '#facc1540' : '#1e1e2a'}`,
              borderRadius: 10, padding: '0.75rem', marginBottom: 6,
            }}>
              {/* Top row: checkbox + severity + category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggleSelect(f.id)}
                  style={{ accentColor: '#facc15' }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                  background: sev.bg, color: sev.color, textTransform: 'uppercase',
                }}>{f.severity}</span>
                <span style={{ fontSize: 11, color: catColor, fontWeight: 500 }}>{f.category}</span>
                <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>
                  {Math.round(f.confidence * 100)}%
                </span>
              </div>

              {/* Title */}
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{f.title}</div>

              {/* Description */}
              {f.description && f.description !== f.title && (
                <div style={{ fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 1.5 }}>
                  {f.description.slice(0, 300)}
                </div>
              )}

              {/* File + old/new values */}
              {f.file && <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>File: {f.file}</div>}
              {f.old_value && (
                <div style={{ fontSize: 11, color: '#ef4444', background: '#1c0a0a', padding: '4px 8px', borderRadius: 4, marginBottom: 2, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'hidden' }}>
                  - {f.old_value.slice(0, 200)}
                </div>
              )}
              {f.new_value && (
                <div style={{ fontSize: 11, color: '#22c55e', background: '#052e16', padding: '4px 8px', borderRadius: 4, marginBottom: 6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'hidden' }}>
                  + {f.new_value.slice(0, 200)}
                </div>
              )}

              {/* Run info */}
              <div style={{ fontSize: 10, color: '#444', marginBottom: 8 }}>
                Run #{f.run_number} · {new Date(f.created_at).toLocaleString()}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => review(f.id, 'approved')} style={actionBtn('#22c55e', '#052e16')}>Approve</button>
                <button onClick={() => review(f.id, 'rejected')} style={actionBtn('#ef4444', '#1c0a0a')}>Reject</button>
              </div>
            </div>
          );
        })}
      </>)}
    </div>
  );
}

function filterBtn(active) {
  return {
    fontSize: 11, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: active ? '#facc1520' : '#111118', color: active ? '#facc15' : '#666',
    fontWeight: active ? 600 : 400,
  };
}

function actionBtn(color, bg) {
  return {
    fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6,
    border: 'none', cursor: 'pointer', background: bg, color,
  };
}
