import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';

const card = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, padding: '.75rem', marginBottom: 6 };
const terminal = {
  background: '#0a0a0f', border: '1px solid #1e1e2a', borderRadius: 8,
  padding: '10px 12px', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.6,
  maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap', color: '#888',
};

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
  const [activeId, setActiveId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [findings, setFindings] = useState(0);
  const logsRef = useRef(null);

  useEffect(() => { api('/commands').then(setCmds); }, []);
  useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

  const send = async (t) => {
    const v = t || text.trim();
    if (!v || running) return;
    setRunning(true);
    setLogs([{ type: 'status', text: `Sending: ${v.slice(0, 80)}...` }]);
    setFindings(0);
    setText('');

    try {
      const { id } = await api('/commands', { text: v, type: 'instruction' });
      setActiveId(id);

      // Subscribe to SSE stream
      const apiBase = new URL('.', window.location.href).href.replace(/\/$/, '');
      const es = new EventSource(`${apiBase}/api/commands/${id}/stream`);

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          if (data.type === 'done') {
            es.close();
            setRunning(false);
            setActiveId(null);
            // Refresh command history
            api('/commands').then(setCmds);
            return;
          }

          if (data.type === 'finding') {
            setFindings(prev => prev + 1);
            setLogs(prev => [...prev, { type: 'finding', text: `[${data.data.severity}] ${data.data.title}` }]);
          } else if (data.type === 'error') {
            setLogs(prev => [...prev, { type: 'error', text: data.text }]);
          } else if (data.type === 'result') {
            setLogs(prev => [...prev, { type: 'result', text: `Done: ${data.text}` }]);
          } else {
            setLogs(prev => [...prev, { type: 'log', text: data.text || JSON.stringify(data) }]);
          }
        } catch {}
      };

      es.onerror = () => {
        es.close();
        setRunning(false);
        setActiveId(null);
        setLogs(prev => [...prev, { type: 'log', text: 'Stream ended.' }]);
        api('/commands').then(setCmds);
      };

    } catch (err) {
      setLogs(prev => [...prev, { type: 'error', text: err.message }]);
      setRunning(false);
    }
  };

  const logColor = { finding: '#f59e0b', error: '#ef4444', result: '#22c55e', status: '#facc15', log: '#888' };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#facc15' }}>Command WW-B</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: '1rem' }}>
        {running ? 'WW-B is working...' : 'Give instructions, share links, or tell WW-B what to do.'}
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
          }}>{running ? 'Working...' : 'Send'}</button>
        </div>
      </div>

      {/* Live output */}
      {logs.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: running ? '#facc15' : '#22c55e' }}>
              {running ? '● Live' : '✓ Complete'}
            </span>
            {findings > 0 && (
              <span style={{ fontSize: 11, color: '#f59e0b' }}>{findings} finding(s) → Review tab</span>
            )}
          </div>
          <div ref={logsRef} style={terminal}>
            {logs.map((l, i) => (
              <div key={i} style={{ color: logColor[l.type] || '#888', marginBottom: 2 }}>
                {l.text}
              </div>
            ))}
            {running && <div style={{ color: '#facc15' }}>▊</div>}
          </div>
        </div>
      )}

      {/* History */}
      <h3 style={{ fontSize: 13, fontWeight: 600, marginTop: '1rem', marginBottom: '.5rem', color: '#888' }}>History</h3>
      {cmds.length === 0
        ? <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: '2rem' }}>No commands yet.</div>
        : cmds.map(c => (
          <div key={c.id} style={{ ...card, borderLeft: `3px solid ${c.status === 'done' ? '#22c55e' : c.status === 'pending' ? '#facc15' : '#555'}` }}>
            <div style={{ fontSize: 13, marginBottom: 4, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{c.text.slice(0, 120)}{c.text.length > 120 ? '...' : ''}</div>
            <div style={{ fontSize: 10, color: '#555' }}>
              {new Date(c.created_at).toLocaleString()} · <span style={{ color: c.status === 'done' ? '#22c55e' : '#facc15' }}>{c.status}</span>
            </div>
            {c.result && (
              <div style={{ fontSize: 11, color: '#888', marginTop: 6, background: '#0a0a0f', padding: '6px 8px', borderRadius: 6, whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden' }}>
                {c.result}
              </div>
            )}
          </div>
        ))
      }
    </div>
  );
}
