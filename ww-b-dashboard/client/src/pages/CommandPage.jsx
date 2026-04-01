import React, { useState, useEffect } from 'react';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '0.75rem', marginBottom: 6 };

const QUICK_ACTIONS = [
  { label: 'Full audit', cmd: 'Run a full audit of the app', icon: '🔍' },
  { label: 'Check banners', cmd: 'Check if banner data needs updating', icon: '🎯' },
  { label: 'Check events', cmd: 'Check if event dates need updating', icon: '📅' },
  { label: 'Find bugs', cmd: 'Run user scenario tests to find bugs', icon: '🐛' },
  { label: 'Check URLs', cmd: 'Check all image URLs for broken links', icon: '🔗' },
];

export default function CommandPage() {
  const [text, setText] = useState('');
  const [commands, setCommands] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/commands').then(r => r.json()).then(c => { setCommands(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function send(cmdText) {
    const t = cmdText || text.trim();
    if (!t) return;
    setSending(true);
    try {
      await fetch('/api/commands', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t, type: 'instruction' }),
      });
      setText('');
      // Refresh list
      const updated = await fetch('/api/commands').then(r => r.json());
      setCommands(updated);
    } catch {}
    setSending(false);
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#facc15' }}>Command WW-B</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: '1rem' }}>
        Give instructions, share links, or tell WW-B what to check next.
      </p>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {QUICK_ACTIONS.map(a => (
          <button key={a.label} onClick={() => send(a.cmd)} disabled={sending} style={{
            fontSize: 11, padding: '6px 10px', borderRadius: 8, border: '1px solid #1e1e2a',
            background: '#111118', color: '#ccc', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {/* Prompt box */}
      <div style={{ ...card, padding: '0.75rem' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type an instruction, paste a link, describe what to check..."
          rows={3}
          style={{
            width: '100%', background: '#0a0a0f', color: '#e0e0e0', border: '1px solid #1e1e2a',
            borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
            resize: 'vertical', outline: 'none', lineHeight: 1.5,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => send()} disabled={!text.trim() || sending} style={{
            fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 8,
            background: !text.trim() || sending ? '#1e1e2a' : '#facc15', color: !text.trim() || sending ? '#666' : '#000',
            border: 'none', cursor: !text.trim() || sending ? 'default' : 'pointer',
          }}>
            {sending ? 'Sending...' : 'Send to WW-B'}
          </button>
        </div>
      </div>

      {/* Command history */}
      <h3 style={{ fontSize: 13, fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#888' }}>
        History
      </h3>
      {loading ? (
        <div style={{ color: '#666', fontSize: 12 }}>Loading...</div>
      ) : commands.length === 0 ? (
        <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: '2rem' }}>No commands yet.</div>
      ) : (
        commands.map(cmd => (
          <div key={cmd.id} style={{
            ...card,
            borderLeft: `3px solid ${cmd.status === 'done' ? '#22c55e' : '#facc15'}`,
          }}>
            <div style={{ fontSize: 13, marginBottom: 4, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{cmd.text}</div>
            <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#555' }}>
              <span>{new Date(cmd.created_at).toLocaleString()}</span>
              <span style={{ color: cmd.status === 'done' ? '#22c55e' : '#facc15' }}>{cmd.status}</span>
              {cmd.type !== 'instruction' && <span style={{ color: '#888' }}>{cmd.type}</span>}
            </div>
            {cmd.result && (
              <div style={{ fontSize: 11, color: '#888', marginTop: 6, background: '#0a0a0f', padding: '6px 8px', borderRadius: 6, whiteSpace: 'pre-wrap' }}>
                {cmd.result}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
