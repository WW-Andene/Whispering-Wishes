import React, { useState, useEffect } from 'react';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '0.75rem', marginBottom: 6 };

export default function ApplyPage() {
  const [findings, setFindings] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/findings/approved').then(r => r.json())
      .then(f => { setFindings(f); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function toggle(id) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function selectAll() {
    if (selected.size === findings.length) setSelected(new Set());
    else setSelected(new Set(findings.map(f => f.id)));
  }

  async function handleApply() {
    if (!selected.size) return;
    setApplying(true);
    setMessage('');
    try {
      // Mark selected as "applied" by sending them as a command for WW-B to pick up
      const toApply = findings.filter(f => selected.has(f.id));
      const text = `APPLY APPROVED FINDINGS:\n${toApply.map(f => `- [${f.category}] ${f.title}`).join('\n')}`;
      await fetch('/api/commands', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: 'apply' }),
      });
      // Move them from approved to a "queued" state
      await fetch('/api/findings/bulk-review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], status: 'approved', note: 'Queued for apply' }),
      });
      setMessage(`${selected.size} finding(s) queued for apply. WW-B will pick them up on next run.`);
      setSelected(new Set());
    } catch (e) { setMessage(`Error: ${e.message}`); }
    setApplying(false);
  }

  async function handleReject(id) {
    await fetch(`/api/findings/${id}/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', note: 'Rejected from apply page' }),
    });
    setFindings(prev => prev.filter(f => f.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#22c55e' }}>Apply Changes</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: '1rem' }}>
        These findings have been approved. Select which ones to apply.
      </p>

      {findings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Nothing to apply</div>
          <div style={{ fontSize: 12 }}>Approve findings from the Review tab first.</div>
        </div>
      ) : (<>
        {/* Select all + apply button */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: '0.75rem', padding: '0.5rem 0.75rem',
          background: '#111118', borderRadius: 8, border: '1px solid #1e1e2a', alignItems: 'center',
        }}>
          <button onClick={selectAll} style={{
            fontSize: 12, color: '#facc15', background: 'none', border: 'none', cursor: 'pointer',
          }}>
            {selected.size === findings.length ? 'Deselect all' : `Select all (${findings.length})`}
          </button>
          <div style={{ flex: 1 }} />
          {selected.size > 0 && (
            <button onClick={handleApply} disabled={applying} style={{
              fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 8,
              background: '#22c55e', color: '#000', border: 'none', cursor: applying ? 'wait' : 'pointer',
            }}>
              {applying ? 'Queuing...' : `Apply ${selected.size} selected`}
            </button>
          )}
        </div>

        {message && (
          <div style={{
            fontSize: 12, padding: '8px 12px', borderRadius: 8, marginBottom: '0.75rem',
            background: message.startsWith('Error') ? '#1c0a0a' : '#052e16',
            color: message.startsWith('Error') ? '#ef4444' : '#22c55e',
            border: `1px solid ${message.startsWith('Error') ? '#ef444440' : '#22c55e40'}`,
          }}>{message}</div>
        )}

        {/* Findings list */}
        {findings.map(f => (
          <div key={f.id} style={{
            ...card,
            borderLeft: `3px solid ${selected.has(f.id) ? '#22c55e' : '#1e1e2a'}`,
            background: selected.has(f.id) ? '#0d1a0f' : '#111118',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggle(f.id)}
                style={{ accentColor: '#22c55e', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                  {f.category} · {f.severity} · {Math.round(f.confidence * 100)}%
                  {f.file && <span> · {f.file}</span>}
                </div>
                {f.old_value && (
                  <div style={{ fontSize: 10, color: '#ef4444', background: '#1c0a0a', padding: '3px 6px', borderRadius: 4, marginBottom: 2, fontFamily: 'monospace', maxHeight: 40, overflow: 'hidden' }}>
                    - {f.old_value.slice(0, 150)}
                  </div>
                )}
                {f.new_value && (
                  <div style={{ fontSize: 10, color: '#22c55e', background: '#052e16', padding: '3px 6px', borderRadius: 4, fontFamily: 'monospace', maxHeight: 40, overflow: 'hidden' }}>
                    + {f.new_value.slice(0, 150)}
                  </div>
                )}
              </div>
              <button onClick={() => handleReject(f.id)} style={{
                fontSize: 10, color: '#ef4444', background: '#1c0a0a', border: 'none',
                padding: '4px 8px', borderRadius: 4, cursor: 'pointer', flexShrink: 0,
              }}>Remove</button>
            </div>
          </div>
        ))}
      </>)}
    </div>
  );
}
