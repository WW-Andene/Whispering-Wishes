import React, { useState, useEffect } from 'react';
import { api } from './api.js';
import HomePage from './pages/HomePage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import ApplyPage from './pages/ApplyPage.jsx';
import CommandPage from './pages/CommandPage.jsx';
import RunsPage from './pages/RunsPage.jsx';

const TABS = ['Home', 'Review', 'Apply', 'Command', 'Runs'];

function KeySetup({ onDone }) {
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!key.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api('/settings/key', { key: key.trim() });
      onDone();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#facc15', marginBottom: 8 }}>WW-B Setup</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Enter your Groq API key to enable commands.<br />
          Free at <span style={{ color: '#facc15' }}>console.groq.com/keys</span>
        </p>
        <input
          type="password" value={key} onChange={e => setKey(e.target.value)}
          placeholder="gsk_..."
          style={{
            width: '100%', background: '#111118', color: '#e0e0e0', border: '1px solid #1e1e2a',
            borderRadius: 8, padding: '12px', fontSize: 14, fontFamily: 'monospace', outline: 'none',
            marginBottom: 12,
          }}
        />
        <button onClick={save} disabled={!key.trim() || saving} style={{
          width: '100%', fontSize: 14, fontWeight: 600, padding: '12px', borderRadius: 8, border: 'none',
          background: !key.trim() || saving ? '#1e1e2a' : '#facc15', color: !key.trim() || saving ? '#666' : '#000',
          cursor: !key.trim() || saving ? 'default' : 'pointer', fontFamily: 'inherit',
        }}>{saving ? 'Saving...' : 'Save & Continue'}</button>
        {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [runId, setRunId] = useState(null);
  const [hasKey, setHasKey] = useState(null); // null = loading

  useEffect(() => {
    api('/settings').then(s => setHasKey(s.hasKey)).catch(() => setHasKey(false));
  }, []);

  const go = (name, id) => {
    const idx = TABS.findIndex(t => t.toLowerCase() === name.toLowerCase());
    if (idx >= 0) setTab(idx);
    if (id) setRunId(id);
  };

  if (hasKey === null) return <div style={{ minHeight: '100vh', background: '#0a0a0f' }} />;
  if (hasKey === false) return <KeySetup onDone={() => setHasKey(true)} />;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0' }}>
      <header style={{
        background: '#111118', borderBottom: '1px solid #1e1e2a',
        padding: '0 0.5rem', display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50, overflowX: 'auto',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#facc15', padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>WW-B</div>
        <nav style={{ display: 'flex', gap: 0 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => { setTab(i); if (i !== 4) setRunId(null); }} style={{
              padding: '0.75rem 0.75rem', fontSize: 12, background: 'none', border: 'none',
              cursor: 'pointer', color: tab === i ? '#facc15' : '#666',
              fontWeight: tab === i ? 600 : 400, whiteSpace: 'nowrap',
              borderBottom: tab === i ? '2px solid #facc15' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'inherit',
            }}>{t}</button>
          ))}
        </nav>
      </header>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
        {tab === 0 && <HomePage go={go} />}
        {tab === 1 && <ReviewPage />}
        {tab === 2 && <ApplyPage />}
        {tab === 3 && <CommandPage />}
        {tab === 4 && <RunsPage runId={runId} onBack={() => setRunId(null)} />}
      </main>
    </div>
  );
}
