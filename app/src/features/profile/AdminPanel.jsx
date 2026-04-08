// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AdminPanel (extracted from ProfileTab)
// Admin panel modal + mini window for banner editing, visual settings,
// player presence, trophy editing, collection image management
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import { Settings, X } from 'lucide-react';
import { DEFAULT_COLLECTION_IMAGES } from '../../data/banners.js';
import { CardHeader } from '../../shared/components/Card.jsx';
import { VisualSliderGroup, VISUAL_SLIDER_CONFIGS } from '../../shared/components/VisualSlider.jsx';
import { ADMIN_HASH } from '../../shared/components/bannerUtils.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { ECHO_DATA } from '../../data/echoes.js';
import { FocusTrapModal } from '../../providers/FocusTrapModal.jsx';
import { ALLOWED_IMAGE_HOSTS } from '../../shared/constants/appConstants.js';

// ── Extracted tab components ─────────────────────────────────────────────────
import AdminBannersTab from './AdminBannersTab.jsx';
import AdminPlayersTab from './AdminPlayersTab.jsx';
import AdminTrophiesTab from './AdminTrophiesTab.jsx';
import AdminMiniPanel from './AdminMiniPanel.jsx';

// ═══ Echo Background Removal Tool ═══════════════════════════════════════════
function EchoBgRemover({ toast, adminHash }) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0, current: '' });
  const [results, setResults] = useState([]);
  const abortRef = useRef(false);

  const allEchoes = Object.entries(ECHO_DATA).filter(([, d]) => d.imageUrl).map(([name, d]) => ({ name, imageUrl: d.imageUrl }));

  const runBatch = async () => {
    abortRef.current = false;
    setStatus('running');
    setResults([]);
    const total = allEchoes.length;
    setProgress({ done: 0, total, current: '' });
    const batchResults = [];

    for (let i = 0; i < total; i++) {
      if (abortRef.current) break;
      const echo = allEchoes[i];
      setProgress({ done: i, total, current: echo.name });
      try {
        const res = await fetch('/api/batch-remove-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': adminHash },
          body: JSON.stringify({ name: echo.name, imageUrl: echo.imageUrl }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          batchResults.push({ name: echo.name, ok: false, error: err.error || `HTTP ${res.status}` });
        } else {
          const data = await res.json();
          batchResults.push({ name: echo.name, ok: true, resultUrl: data.resultUrl, size: data.size });
        }
      } catch (err) {
        batchResults.push({ name: echo.name, ok: false, error: err.message });
      }
      setResults([...batchResults]);
    }
    setProgress(p => ({ ...p, done: batchResults.length, current: '' }));
    setStatus(abortRef.current ? 'idle' : 'done');
    const ok = batchResults.filter(r => r.ok).length;
    toast?.addToast?.(`Done! ${ok}/${total} backgrounds removed.`, ok === total ? 'success' : 'warning');
  };

  const downloadAll = () => {
    const ok = results.filter(r => r.ok);
    if (!ok.length) return;
    ok.forEach((r, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = r.resultUrl;
        a.download = `${r.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-nobg.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 300);
    });
    toast?.addToast?.(`Downloading ${ok.length} images...`, 'info');
  };

  return (
    <div className="space-y-3">
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
        <p className="text-pink-400 text-xs font-medium mb-1">Echo Background Removal</p>
        <p className="text-gray-400 text-xs">
          Removes backgrounds from all {allEchoes.length} echo images using HuggingFace AI (BRIA-RMBG-1.4).
          Requires HF_API_KEY + ADMIN_HASH in Vercel env vars. Download results as PNGs and re-upload to ibb.co.
        </p>
      </div>
      <div className="flex gap-2">
        <button onClick={runBatch} disabled={status === 'running'} className={`kuro-btn flex-1 text-xs py-2 ${status === 'running' ? 'opacity-50' : 'active-pink'}`}>
          {status === 'running' ? `Processing ${progress.done}/${progress.total}...` : status === 'done' ? 'Run Again' : `Remove BG (${allEchoes.length} images)`}
        </button>
        {status === 'running' && (
          <button onClick={() => { abortRef.current = true; }} className="kuro-btn text-xs py-2 text-red-400 border-red-500/30">Stop</button>
        )}
      </div>
      {status === 'running' && (
        <div>
          <div className="h-2 rounded-full overflow-hidden bg-white/5">
            <div className="h-full bg-pink-500 transition-all duration-300 rounded-full" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
          <p className="text-gray-400 text-sm mt-1 truncate">Processing: {progress.current}</p>
        </div>
      )}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">{results.filter(r => r.ok).length} succeeded, {results.filter(r => !r.ok).length} failed</p>
            {results.some(r => r.ok) && (
              <button onClick={downloadAll} className="kuro-btn text-xs px-3 py-1 active-emerald">Download All PNGs</button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {results.map(r => (
              <div key={r.name} className={`kuro-badge ${r.ok ? 'kuro-badge-emerald' : 'kuro-badge-red'}`}>
                <span>{r.ok ? '✓' : '✗'}</span>
                <span className="flex-1 truncate">{r.name}</span>
                {r.ok && r.resultUrl && (<a href={r.resultUrl} download={`${r.name}-nobg.png`} className="text-cyan-400 underline">Save</a>)}
                {!r.ok && <span className="text-gray-500 truncate">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ AdminPanel ═════════════════════════════════════════════════════════════
export default function AdminPanel({
  showAdminPanel, setShowAdminPanel,
  adminUnlocked, setAdminUnlocked,
  adminPassword, setAdminPassword,
  adminTab, setAdminTab,
  adminMiniMode, setAdminMiniMode,
  bannerForm, setBannerForm,
  trophyJsonInput, setTrophyJsonInput,
  activePlayersCount, activePlayersHistory,
  presenceError, adminPlayerList,
  adminLockedUntil,
  trophies,
  fetchActivePlayersCount, fetchAdminPlayerList,
  trophyOverrides, setTrophyOverrides,
  verifyAdminPassword, saveCustomBanners,
  buildBannerForm, updateBannerForm,
  visualSettings, saveVisualSettings,
  customCollectionImages, saveCollectionImages, collectionImages,
  activeBanners, setActiveBanners,
  state, dispatch, toast, confirm,
  adminTrapRef,
  setActiveTab,
  withCacheBuster,
  detailModal,
  DEFAULT_VISUAL_SETTINGS,
  bgFramingMode, setBgFramingMode,
  editingBgTarget, setEditingBgTarget,
  updateBgPosition, getBgPositionLabel, exportBgPositions,
}) {
  if (!showAdminPanel) return null;

  const ADMIN_TABS = [
    { key: 'banners', label: 'Banners', active: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' },
    { key: 'collection', label: 'Collection', active: 'bg-purple-500/10 text-purple-400 border border-purple-500/30' },
    { key: 'visuals', label: 'Visual Settings', active: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' },
    { key: 'trophies', label: 'Trophies', active: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
    { key: 'players', label: <><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />Players</>, active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
    { key: 'echobg', label: 'Echo BG', active: 'bg-pink-500/10 text-pink-400 border border-pink-500/30' },
    { key: 'diag', label: 'Import Log', active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
  ];

  return (
    <>
      {/* Admin Panel Modal */}
      <FocusTrapModal isOpen={showAdminPanel && !adminMiniMode} onClose={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="" onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} ariaLabel="Admin panel" centered>
          <div className="kuro-card w-full max-w-2xl max-h-[90vh]" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="kuro-card-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <CardHeader action={<button onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close admin panel"><X size={16} /></button>}>
              <span className="flex items-center gap-2"><Settings size={16} /> Admin Panel</span>
            </CardHeader>
            <div className="kuro-body space-y-3" style={{ overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
              {!adminUnlocked ? (
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <p className="text-yellow-400 text-sm font-medium">Admin Access Required</p>
                    <p className="text-gray-400 text-sm mt-1">Enter admin password to continue</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && verifyAdminPassword()}
                      className="kuro-input flex-1 text-sm"
                      aria-label="Admin password"
                      aria-invalid={adminLockedUntil > Date.now() ? true : undefined}
                      aria-describedby={adminLockedUntil > Date.now() ? 'admin-lockout-msg' : undefined}
                    />
                    <button onClick={verifyAdminPassword} className="kuro-btn px-4" aria-label="Unlock admin panel">Unlock</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-center">
                    <p className="text-emerald-400 text-xs">Admin Panel Unlocked</p>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex gap-2 border-b border-[var(--border-medium)] pb-2 flex-wrap">
                    {ADMIN_TABS.map(({ key, label, active }) => (
                      <button
                        key={key}
                        onClick={() => setAdminTab(key)}
                        className={`px-3 py-1.5 rounded text-xs transition-all ${adminTab === key ? active : 'text-gray-400 hover:text-white border border-[var(--border-medium)]'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* ── Tab Content ──────────────────────────────── */}

                  {adminTab === 'banners' && (
                    <AdminBannersTab
                      bannerForm={bannerForm} setBannerForm={setBannerForm} updateBannerForm={updateBannerForm}
                      activeBanners={activeBanners} setActiveBanners={setActiveBanners}
                      saveCustomBanners={saveCustomBanners}
                      setShowAdminPanel={setShowAdminPanel} setAdminUnlocked={setAdminUnlocked} setAdminPassword={setAdminPassword}
                      toast={toast} confirm={confirm}
                    />
                  )}

                  {adminTab === 'collection' && (
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <h3 className="text-purple-400 text-sm font-medium mb-3">Collection Images</h3>
                        <p className="text-gray-400 text-sm mb-3">Most resonators have built-in images. Use custom URLs to override or fill in missing ones.</p>
                        {(() => {
                          const allHistory = [
                            ...state.profile.featured.history,
                            ...state.profile.weapon.history,
                            ...(state.profile.standardChar?.history || []),
                            ...(state.profile.standardWeap?.history || [])
                          ];
                          const uniqueNames = [...new Set(allHistory.filter(p => p.rarity >= 4 && p.name).map(p => p.name))].sort();
                          if (uniqueNames.length === 0) {
                            return <div className="kuro-empty-state text-center py-4"><p className="text-gray-400 text-sm">Import Convene data to populate your archive</p><button onClick={() => setActiveTab('profile')} className="kuro-btn kuro-btn-primary text-xs mt-2 px-3 py-1.5">Go to Import</button></div>;
                          }
                          return (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                              {uniqueNames.map(name => {
                                const hasDefault = DEFAULT_COLLECTION_IMAGES[name];
                                const hasCustom = customCollectionImages[name];
                                const displayUrl = collectionImages[name];
                                return (
                                  <div key={name} className="flex items-center gap-2">
                                    <span className={`text-xs w-32 truncate ${hasDefault ? 'text-gray-300' : 'text-yellow-400'}`} title={hasDefault ? name : `${name} (no default)`}>
                                      {name} {!hasDefault && '⚠'}
                                    </span>
                                    <input
                                      type="text"
                                      placeholder={hasDefault ? "(using default)" : "https://i.ibb.co/..."}
                                      value={hasCustom || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.trim();
                                        const newCustom = { ...customCollectionImages };
                                        if (val) {
                                          if (val.length > 5 && !/^https:\/\//i.test(val)) return;
                                          if (val.length > 10) { try { const h = new URL(val).hostname; if (!ALLOWED_IMAGE_HOSTS.some(d => h === d || h.endsWith('.'+d))) return; } catch { return; } }
                                          newCustom[name] = val;
                                        } else {
                                          delete newCustom[name];
                                        }
                                        saveCollectionImages(newCustom);
                                      }}
                                      className={`kuro-input flex-1 text-xs py-1 ${hasCustom ? 'border-purple-500/50' : ''}`}
                                    />
                                    {displayUrl && (
                                      <img src={displayUrl} alt={name} className="w-[28px] h-[28px] object-cover rounded border border-purple-500/30" loading="lazy" onError={hideOnError} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => { if (await confirm({ title: 'Clear overrides', message: 'Clear all custom image overrides?', confirmLabel: 'Clear', destructive: true })) saveCollectionImages({}); }}
                          className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/30"
                        >
                          Clear Custom Overrides
                        </button>
                      </div>
                    </div>
                  )}

                  {adminTab === 'visuals' && (
                    <div className="space-y-4">
                      {VISUAL_SLIDER_CONFIGS.map(cfg => (
                        <React.Fragment key={cfg.color}>
                          {cfg.subtitle && (
                            <div className={`${cfg.color === 'purple' ? 'bg-purple-500/10 border border-purple-500/30' : ''} rounded p-3`}>
                              <VisualSliderGroup title={cfg.title} color={cfg.color} sliders={cfg.sliders} visualSettings={visualSettings} saveVisualSettings={saveVisualSettings} directionControl={cfg.directionControl} />
                            </div>
                          )}
                          {!cfg.subtitle && (
                            <VisualSliderGroup title={cfg.title} color={cfg.color} sliders={cfg.sliders} visualSettings={visualSettings} saveVisualSettings={saveVisualSettings} directionControl={cfg.directionControl} />
                          )}
                        </React.Fragment>
                      ))}
                      <div className="flex gap-2">
                        <button onClick={() => setAdminMiniMode(true)} className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-xs hover:bg-emerald-500/30">🗗 Mini Window</button>
                        <button onClick={async () => { if (await confirm({ title: 'Reset settings', message: 'Reset all visual settings to defaults?', confirmLabel: 'Reset', destructive: true })) saveVisualSettings(DEFAULT_VISUAL_SETTINGS); }} className="flex-1 px-4 py-2 bg-neutral-700 text-gray-300 rounded text-xs hover:bg-neutral-600">Reset to Defaults</button>
                      </div>
                    </div>
                  )}

                  {adminTab === 'players' && (
                    <AdminPlayersTab
                      activePlayersCount={activePlayersCount} activePlayersHistory={activePlayersHistory}
                      presenceError={presenceError} adminPlayerList={adminPlayerList}
                      fetchActivePlayersCount={fetchActivePlayersCount} fetchAdminPlayerList={fetchAdminPlayerList}
                    />
                  )}

                  {adminTab === 'trophies' && (
                    <AdminTrophiesTab
                      trophies={trophies} trophyOverrides={trophyOverrides} setTrophyOverrides={setTrophyOverrides}
                      trophyJsonInput={trophyJsonInput} setTrophyJsonInput={setTrophyJsonInput}
                      setActiveTab={setActiveTab} toast={toast} confirm={confirm}
                    />
                  )}

                  {adminTab === 'echobg' && <EchoBgRemover toast={toast} adminHash={ADMIN_HASH} />}

                  {adminTab === 'diag' && (() => {
                    let diag = null;
                    try { diag = JSON.parse(localStorage.getItem('ww-import-diagnostic')); } catch {}
                    return (
                      <div className="space-y-3">
                        <div className="text-xs text-gray-400">Last import diagnostic{diag?.timestamp ? ` — ${new Date(diag.timestamp).toLocaleString()}` : ''}</div>
                        {diag?.log ? (
                          <pre className="text-xs font-mono text-emerald-400 bg-black/40 p-3 rounded-lg whitespace-pre-wrap overflow-auto max-h-[40vh]">{diag.log}</pre>
                        ) : (
                          <div className="text-gray-400 text-xs text-center py-4">No diagnostic log yet. Run a direct API import to generate one.</div>
                        )}
                        {diag && (
                          <button onClick={() => {
                            const blob = new Blob([JSON.stringify(diag, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ww-import-diagnostic-${new Date().toISOString().slice(0,10)}.json`;
                            document.body.appendChild(a); a.click(); document.body.removeChild(a);
                            setTimeout(() => URL.revokeObjectURL(url), 100);
                          }} className="kuro-btn w-full text-xs">Download Diagnostic Log</button>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
            </div>
          </div>
      </FocusTrapModal>

      {/* Admin Mini Window — portaled to body */}
      {showAdminPanel && adminMiniMode && adminUnlocked && (
        <AdminMiniPanel
          setShowAdminPanel={setShowAdminPanel} setAdminMiniMode={setAdminMiniMode}
          visualSettings={visualSettings} saveVisualSettings={saveVisualSettings} DEFAULT_VISUAL_SETTINGS={DEFAULT_VISUAL_SETTINGS}
          bgFramingMode={bgFramingMode} setBgFramingMode={setBgFramingMode}
          editingBgTarget={editingBgTarget} setEditingBgTarget={setEditingBgTarget}
          updateBgPosition={updateBgPosition} getBgPositionLabel={getBgPositionLabel} exportBgPositions={exportBgPositions}
          detailModal={detailModal} toast={toast} confirm={confirm}
        />
      )}
    </>
  );
}
