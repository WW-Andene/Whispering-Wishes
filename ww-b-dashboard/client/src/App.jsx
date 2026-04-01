import React, { useState } from 'react';
import DashboardPage from './pages/DashboardPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import ApplyPage from './pages/ApplyPage.jsx';
import CommandPage from './pages/CommandPage.jsx';
import RunsPage from './pages/RunsPage.jsx';

const TABS = ['Home', 'Review', 'Apply', 'Command', 'Runs'];

export default function App() {
  const [tab, setTab] = useState(0);
  const [selectedRun, setSelectedRun] = useState(null);

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
            <button key={t} onClick={() => { setTab(i); if (i !== 4) setSelectedRun(null); }} style={{
              padding: '0.75rem 0.75rem', fontSize: 12, background: 'none', border: 'none',
              cursor: 'pointer', color: tab === i ? '#facc15' : '#666',
              fontWeight: tab === i ? 600 : 400, whiteSpace: 'nowrap',
              borderBottom: tab === i ? '2px solid #facc15' : '2px solid transparent',
              marginBottom: -1,
            }}>{t}</button>
          ))}
        </nav>
      </header>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
        {tab === 0 && <DashboardPage onViewRun={(id) => { setSelectedRun(id); setTab(4); }} />}
        {tab === 1 && <ReviewPage />}
        {tab === 2 && <ApplyPage />}
        {tab === 3 && <CommandPage />}
        {tab === 4 && <RunsPage selectedRun={selectedRun} />}
      </main>
    </div>
  );
}
