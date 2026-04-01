import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '.75rem', marginBottom: 6 };

const QUICK = [
  ['🔍 Full audit', 'Run a full audit of the app'],
  ['🎯 Banners', 'Check if banner data needs updating'],
  ['📅 Events', 'Check if event dates need updating'],
  ['🐛 Bugs', 'Run user scenario tests to find bugs'],
  ['🔗 URLs', 'Check all image URLs for broken links'],
];

export default function CommandPage() {
  const [text, setText] = useState('');
  const [cmds, setCmds] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => { api('/commands').then(setCmds); }, []);

  const send = async (t) => {
    const v = t || text.trim();
    if (!v) return;
    setSending(true);
    await api('/commands', { text: v, type: 'instruction' });
    setText('');
    setCmds(await api('/commands'));
    setSending(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#facc15' }}>Command WW-B</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: '1rem' }}>Give instructions, share links, or tell WW-B what to do.</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {QUICK.map(([label, cmd]) => (
          <button key={label} onClick={() => send(cmd)} disabled={sending} style={{
            fontSize: 11, padding: '6px 10px', borderRadius: 8, border: '1px solid #1e1e2a',
            background: '#111118', color: '#ccc', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      <div style={card}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type instructions, paste a link, describe what to check..." rows={3}
          style={{ width: '100%', background: '#0a0a0f', color: '#e0e0e0', border: '1px solid #1e1e2a', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.5 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => send()} disabled={!text.trim() || sending} style={{
            fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 8, border: 'none', cursor: !text.trim() || sending ? 'default' : 'pointer', fontFamily: 'inherit',
            background: !text.trim() || sending ? '#1e1e2a' : '#facc15', color: !text.trim() || sending ? '#666' : '#000',
          }}>{sending ? 'Sending...' : 'Send'}</button>
        </div>
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 600, marginTop: '1.5rem', marginBottom: '.5rem', color: '#888' }}>History</h3>
      {cmds.length === 0
        ? <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: '2rem' }}>No commands yet.</div>
        : cmds.map(c => (
          <div key={c.id} style={{ ...card, borderLeft: `3px solid ${c.status === 'done' ? '#22c55e' : '#facc15'}` }}>
            <div style={{ fontSize: 13, marginBottom: 4, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{c.text}</div>
            <div style={{ fontSize: 10, color: '#555' }}>
              {new Date(c.created_at).toLocaleString()} · <span style={{ color: c.status === 'done' ? '#22c55e' : '#facc15' }}>{c.status}</span>
            </div>
            {c.result && <div style={{ fontSize: 11, color: '#888', marginTop: 6, background: '#0a0a0f', padding: '6px 8px', borderRadius: 6, whiteSpace: 'pre-wrap' }}>{c.result}</div>}
          </div>
        ))
      }
    </div>
  );
}
