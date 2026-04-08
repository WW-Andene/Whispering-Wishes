// ═══════════════════════════════════════════════════════════════════════════════
// AdminTrophiesTab — Trophy name/desc editor with JSON import/export
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { TROPHY_OVERRIDES_KEY } from '../../shared/constants/appConstants.js';

export default function AdminTrophiesTab({
  trophies, trophyOverrides, setTrophyOverrides,
  trophyJsonInput, setTrophyJsonInput,
  setActiveTab, toast, confirm,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
        <h3 className="text-amber-400 text-md font-medium mb-2">Trophy Name Editor</h3>
        <p className="text-gray-400 text-sm mb-3">Override trophy names and descriptions. Paste a JSON object where keys are trophy IDs and values have <code className="text-amber-400/80">name</code> and/or <code className="text-amber-400/80">desc</code> fields.</p>

        {/* Current trophies list */}
        <div className="mb-3">
          <div className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Current Trophies ({trophies?.list?.length || 0})</div>
          <div className="max-h-[200px] overflow-y-auto kuro-scroll bg-black/30 rounded border border-[var(--border-medium)] p-2 space-y-0.5">
            {(trophies?.list || []).map(t => (
              <div key={t.id} className="flex items-center gap-2 py-0.5">
                <span className="text-sm font-mono text-gray-500 w-20 flex-shrink-0 truncate" title={t.id}>{t.id}</span>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                <span className={`text-sm flex-1 truncate ${trophyOverrides[t.id] ? 'text-amber-400' : 'text-gray-300'}`} title={t.name}>{t.name}</span>
                <span className="text-[8px] text-gray-500 flex-shrink-0">{t.name.length}ch</span>
              </div>
            ))}
            {(!trophies?.list || trophies.list.length === 0) && (
              <div className="kuro-empty-state text-center py-4"><p className="text-gray-400 text-base">Import Convene data to unlock achievements</p><button onClick={() => setActiveTab('profile')} className="kuro-btn kuro-btn-primary text-sm mt-2 px-3 py-1.5">Go to Import</button></div>
            )}
          </div>
        </div>

        {/* Export current as JSON */}
        <button
          onClick={() => {
            const data = {};
            (trophies?.list || []).forEach(t => { data[t.id] = { name: t.name, desc: t.desc }; });
            navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
            toast?.addToast?.('Trophy data copied to clipboard', 'success');
          }}
          className="w-full mb-3 px-3 py-1.5 bg-white/5 border border-[var(--border-medium)] text-gray-300 rounded text-sm hover:bg-white/10 transition-colors"
        >
          Export Current Trophies as JSON
        </button>

        {/* JSON import textarea */}
        <div className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Import Overrides (JSON)</div>
        <textarea
          className="kuro-input w-full h-40 text-sm font-mono"
          value={trophyJsonInput}
          onChange={(e) => setTrophyJsonInput(e.target.value)}
          placeholder={'{\n  "pity1": { "name": "New Name Here", "desc": "New description" },\n  "win7": { "name": "Another Name" }\n}'}
          aria-label="Trophy overrides JSON input"
        />
        <p className="text-gray-400 text-sm mt-1 mb-2">Only include trophies you want to rename. Omit <code className="text-amber-400/60">desc</code> to keep the original description.</p>

        <div className="flex gap-2">
          <button
            onClick={() => {
              try {
                const parsed = JSON.parse(trophyJsonInput);
                if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Must be a JSON object');
                const cleaned = {};
                let count = 0;
                for (const [id, val] of Object.entries(parsed)) {
                  if (typeof val !== 'object' || !val) continue;
                  const entry = {};
                  if (val.name && typeof val.name === 'string') entry.name = val.name.trim();
                  if (val.desc && typeof val.desc === 'string') entry.desc = val.desc.trim();
                  if (Object.keys(entry).length > 0) { cleaned[id] = entry; count++; }
                }
                setTrophyOverrides(cleaned);
                try { localStorage.setItem(TROPHY_OVERRIDES_KEY, JSON.stringify(cleaned)); } catch {}
                toast?.addToast?.(`Applied ${count} trophy override${count !== 1 ? 's' : ''}`, 'success');
              } catch (e) {
                toast?.addToast?.('Invalid JSON: ' + e.message, 'error');
              }
            }}
            className="kuro-btn flex-1 text-base"
          >
            Apply Overrides
          </button>
          <button
            onClick={async () => {
              if (!await confirm({ title: 'Clear overrides', message: 'Clear all trophy name overrides?', confirmLabel: 'Clear', destructive: true })) return;
              setTrophyOverrides({});
              setTrophyJsonInput('');
              try { localStorage.removeItem(TROPHY_OVERRIDES_KEY); } catch {}
              toast?.addToast?.('Trophy overrides cleared', 'success');
            }}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-base hover:bg-red-500/30"
          >
            Clear All
          </button>
        </div>

        {/* Active overrides count */}
        {Object.keys(trophyOverrides).length > 0 && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded p-2 text-sm text-amber-400">
            {Object.keys(trophyOverrides).length} active override{Object.keys(trophyOverrides).length !== 1 ? 's' : ''}: {Object.keys(trophyOverrides).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
