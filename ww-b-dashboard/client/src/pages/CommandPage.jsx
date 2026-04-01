import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '.75rem', marginBottom: 6 };

const QUICK = [
  ['🔍 Full audit', 'Analyze the Whispering Wishes app codebase for bugs, UX issues, and edge cases. Check data consistency, look for potential crashes, NaN values, broken states.'],
  ['🎯 Banners', 'Check the current Wuthering Waves banner data. Are the dates still valid? Has a new banner phase started? Any discrepancies with live game data?'],
  ['📅 Events', 'Check all event dates and timers. Are any events expired? Do any dates need updating? Are there new events that should be added?'],
  ['🐛 Bugs', 'Simulate 5 user scenarios and find bugs: 1) New player first launch 2) Banner expiry transition 3) Whale with max collection 4) Data import edge cases 5) Team builder stress test'],
  ['🔗 URLs', 'Check if any image URLs in the app data might be broken or returning errors. Look for patterns like incorrect hostnames, missing paths, or deprecated CDN URLs.'],
];

export default function CommandPage() {
  const [text, setText] = useState('');
  const [cmds, setCmds] = useState([]);
  const [running, setRunning] = useState(false);

  const refresh = () => api('/commands').then(setCmds);
  useEffect(() => { refresh(); }, []);

  // Poll while running
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(async () => {
      const updated = await api('/commands');
      setCmds(updated);
      // Check if the latest command is done
      const latest = updated[0];
      if (latest && latest.status === 'done') {
        setRunning(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [running]);

  const send = async (t) => {
    const v = t || text.trim();
    if (!v || running) return;
    setRunning(true);
    setText('');
    await api('/commands', { text: v, type: 'instruction' });
    // Immediately refresh to show pending command
    refresh();
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#facc15' }}>Command WW-B</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: '1rem' }}>
        {running ? '⏳ WW-B is thinking...' : 'Give instructions, share links, or tell WW-B what to do.'}
      </p>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {QUICK.map(([label, cmd]) => (
          <button key={label} onClick={() => send(cmd)} disabled={running} style={{
            fontSize: 11, padding: '6px 10px', borderRadius: 8, border: '1px solid #1e1e2a',
            background: running ? '#0d0d14' : '#111118', color: running ? '#444' : '#ccc',
            cursor: running ? 'default' : 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      {/* Prompt box */}
      <div style={card}>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Type instructions, paste a link, describe what to check..."
          rows={3} disabled={running}
          style={{
            width: '100%', background: '#0a0a0f', color: '#e0e0e0', border: '1px solid #1e1e2a',
            borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
            resize: 'vertical', outline: 'none', lineHeight: 1.5,
            opacity: running ? 0.5 : 1,
          }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => send()} disabled={!text.trim() || running} style={{
            fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 8, border: 'none',
            cursor: !text.trim() || running ? 'default' : 'pointer', fontFamily: 'inherit',
            background: !text.trim() || running ? '#1e1e2a' : '#facc15',
            color: !text.trim() || running ? '#666' : '#000',
          }}>{running ? '⏳ Working...' : 'Send'}</button>
        </div>
      </div>

      {/* History */}
      <h3 style={{ fontSize: 13, fontWeight: 600, marginTop: '1rem', marginBottom: '.5rem', color: '#888' }}>History</h3>
      {cmds.length === 0
        ? <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: '2rem' }}>No commands yet.</div>
        : cmds.map(c => (
          <div key={c.id} style={{
            ...card,
            borderLeft: `3px solid ${c.status === 'done' ? '#22c55e' : '#facc15'}`,
          }}>
            <div style={{ fontSize: 13, marginBottom: 4, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {c.text.slice(0, 200)}{c.text.length > 200 ? '...' : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#555' }}>
              <span>{new Date(c.created_at).toLocaleString()}</span>
              <span style={{ color: c.status === 'done' ? '#22c55e' : '#facc15', fontWeight: 600 }}>
                {c.status === 'done' ? '✓ Done' : '⏳ Working...'}
              </span>
            </div>
            {c.result && (
              <div style={{
                fontSize: 12, color: '#ccc', marginTop: 8, background: '#0a0a0f',
                padding: '10px 12px', borderRadius: 8, whiteSpace: 'pre-wrap',
                lineHeight: 1.6, maxHeight: 300, overflowY: 'auto',
                border: '1px solid #1e1e2a',
              }}>
                {c.result}
              </div>
            )}
          </div>
        ))
      }
    </div>
  );
}
