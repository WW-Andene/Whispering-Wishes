import React, { useState } from 'react';
import DashboardPage from './pages/DashboardPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import RunsPage from './pages/RunsPage.jsx';

const TABS = ['Dashboard', 'Review', 'Runs'];

export default function App() {
  const [tab, setTab] = useState(0);
  const [selectedRun, setSelectedRun] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0' }}>
      {/* Header */}
      <header style={{
        background: '#111118', borderBottom: '1px solid #1e1e2a',
        padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '1rem',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#facc15', padding: '0.75rem 0', whiteSpace: 'nowrap' }}>
          WW-B
        </div>
        <nav style={{ display: 'flex', gap: 0, flex: 1 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => { setTab(i); if (i !== 2) setSelectedRun(null); }} style={{
              padding: '0.75rem 1rem', fontSize: 13, background: 'none', border: 'none',
              cursor: 'pointer', color: tab === i ? '#facc15' : '#666',
              fontWeight: tab === i ? 600 : 400,
              borderBottom: tab === i ? '2px solid #facc15' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
        {tab === 0 && <DashboardPage onViewRun={(id) => { setSelectedRun(id); setTab(2); }} />}
        {tab === 1 && <ReviewPage />}
        {tab === 2 && <RunsPage selectedRun={selectedRun} />}
      </main>
    </div>
  );
}
