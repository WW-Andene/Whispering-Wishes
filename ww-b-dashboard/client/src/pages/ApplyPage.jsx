import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '.75rem', marginBottom: 6 };

export default function ApplyPage() {
  const [findings, setFindings] = useState([]);
  const [sel, setSel] = useState(new Set());
  const [msg, setMsg] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { api('/findings/approved').then(f => { setFindings(f); setLoaded(true); }); }, []);

  const toggle = id => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selAll = () => sel.size === findings.length ? setSel(new Set()) : setSel(new Set(findings.map(f => f.id)));

  const remove = async (id) => {
    await api(`/findings/${id}/review`, { status: 'rejected', note: 'Removed from apply' });
    setFindings(p => p.filter(f => f.id !== id));
  };

  const apply = async () => {
    if (!sel.size) return;
    const items = findings.filter(f => sel.has(f.id));
    await api('/commands', { text: `APPLY:\n${items.map(f => `- [${f.category}] ${f.title}`).join('\n')}`, type: 'apply' });
    setMsg(`${sel.size} queued for WW-B`);
    setSel(new Set());
  };

  if (!loaded) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>;
  if (!findings.length) return <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}><h3 style={{ fontSize: 16, marginBottom: 8 }}>Nothing to apply</h3><p style={{ fontSize: 12 }}>Approve findings from Review tab first.</p></div>;

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#22c55e' }}>Apply Changes</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: '1rem' }}>Select approved findings to apply.</p>

      <div style={{ ...card, display: 'flex', gap: 8, alignItems: 'center', padding: '.5rem .75rem' }}>
        <button onClick={selAll} style={{ fontSize: 12, color: '#facc15', background: 'none', border: 'none', cursor: 'pointer' }}>
          {sel.size === findings.length ? 'Deselect' : `Select all (${findings.length})`}
        </button>
        <div style={{ flex: 1 }} />
        {sel.size > 0 && (
          <button onClick={apply} style={{ fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 8, background: '#22c55e', color: '#000', border: 'none', cursor: 'pointer' }}>
            Apply {sel.size} selected
          </button>
        )}
      </div>

      {msg && (
        <div style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, marginBottom: '.75rem', background: '#052e16', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
          {msg}
        </div>
      )}

      {findings.map(f => (
        <div key={f.id} style={{ ...card, borderLeft: `3px solid ${sel.has(f.id) ? '#22c55e' : '#1e1e2a'}`, background: sel.has(f.id) ? '#0d1a0f' : '#111118' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <input type="checkbox" checked={sel.has(f.id)} onChange={() => toggle(f.id)} style={{ accentColor: '#22c55e', marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{f.category} · {f.severity} · {Math.round(f.confidence * 100)}%{f.file ? ` · ${f.file}` : ''}</div>
              {f.old_value && <div style={{ fontSize: 10, color: '#ef4444', background: '#1c0a0a', padding: '3px 6px', borderRadius: 4, marginBottom: 2, fontFamily: 'monospace', maxHeight: 40, overflow: 'hidden', whiteSpace: 'pre-wrap' }}>- {f.old_value.slice(0, 150)}</div>}
              {f.new_value && <div style={{ fontSize: 10, color: '#22c55e', background: '#052e16', padding: '3px 6px', borderRadius: 4, fontFamily: 'monospace', maxHeight: 40, overflow: 'hidden', whiteSpace: 'pre-wrap' }}>+ {f.new_value.slice(0, 150)}</div>}
            </div>
            <button onClick={() => remove(f.id)} style={{ fontSize: 10, color: '#ef4444', background: '#1c0a0a', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', flexShrink: 0 }}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}
