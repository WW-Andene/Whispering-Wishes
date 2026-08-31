// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AdminPanel (extracted from ProfileTab)
// Admin panel modal + mini window for banner editing, visual settings,
// player presence, trophy editing, collection image management
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import { Settings, X } from 'lucide-react';
import { DEFAULT_COLLECTION_IMAGES } from '../../data/banners.js';
import { CardHeader } from '../../shared/components/Card.jsx';
import { apiUrl } from '../../utils/apiBase.js';
import { VisualSliderGroup, VISUAL_SLIDER_CONFIGS } from '../../shared/components/VisualSlider.jsx';
import { ADMIN_HASH } from '../../shared/components/bannerUtils.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { ECHO_DATA } from '../../data/echoes.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { ALLOWED_IMAGE_HOSTS } from '../../shared/constants/appConstants.js';
import { getDebugPaddingEnabled, setDebugPaddingEnabled } from '../../shared/components/PaddingDebugOverlay.jsx';
import { t } from '../../utils/i18n.js';

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
        const res = await fetch(apiUrl('/api/batch-remove-bg'), {
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
    toast?.addToast?.(t('admin.echoBg.doneToast', { ok, total }), ok === total ? 'success' : 'warning');
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
    toast?.addToast?.(t('admin.echoBg.downloadingToast', { count: ok.length }), 'info');
  };

  return (
    <div className="space-y-3">
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
        <p className="text-pink-400 text-base font-medium mb-1">{t('admin.echoBg.title')}</p>
        <p className="text-gray-400 text-sm">
          {t('admin.echoBg.desc', { count: allEchoes.length })}
        </p>
      </div>
      <div className="flex gap-2">
        <button onClick={runBatch} disabled={status === 'running'} className={`kuro-btn flex-1 text-base py-2 ${status === 'running' ? 'opacity-50' : 'active-pink'}`}>
          {status === 'running' ? t('admin.echoBg.processing', { done: progress.done, total: progress.total }) : status === 'done' ? t('admin.echoBg.runAgain') : t('admin.echoBg.removeBg', { count: allEchoes.length })}
        </button>
        {status === 'running' && (
          <button onClick={() => { abortRef.current = true; }} className="kuro-btn text-base py-2 text-red-400 border-red-500/30">{t('admin.echoBg.stop')}</button>
        )}
      </div>
      {status === 'running' && (
        <div>
          <div className="h-2 rounded-full overflow-hidden bg-white/5">
            <div className="h-full bg-pink-500 transition-all duration-300 rounded-full" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
          <p className="text-gray-400 text-sm mt-1 truncate">{t('admin.echoBg.processingLabel', { name: progress.current })}</p>
        </div>
      )}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">{t('admin.echoBg.succeededFailed', { ok: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length })}</p>
            {results.some(r => r.ok) && (
              <button onClick={downloadAll} className="kuro-btn text-sm px-3 py-1 active-emerald">{t('admin.echoBg.downloadAllPngs')}</button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {results.map(r => (
              <div key={r.name} className={`kuro-badge ${r.ok ? 'kuro-badge-emerald' : 'kuro-badge-red'}`}>
                <span>{r.ok ? '✓' : '✗'}</span>
                <span className="flex-1 truncate">{r.name}</span>
                {r.ok && r.resultUrl && (<a href={r.resultUrl} download={`${r.name}-nobg.png`} className="text-cyan-400 underline">{t('admin.echoBg.save')}</a>)}
                {!r.ok && <span className="text-gray-500 truncate">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ Padding Debug Toggle ═══════════════════════════════════════════════════
function PaddingDebugTab() {
  const [enabled, setEnabled] = useState(getDebugPaddingEnabled);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setDebugPaddingEnabled(next);
  };

  return (
    <div className="space-y-3">
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
        <p className="text-pink-400 text-base font-medium mb-1">Padding debug</p>
        <p className="text-gray-400 text-sm">
          Affiche en surimpression, sur toute l'app, le padding de chaque élément (bandes roses + valeurs en px). Reste actif même après avoir fermé ce panneau.
        </p>
      </div>
      <button
        onClick={toggle}
        className={`kuro-btn w-full text-base py-2 ${enabled ? 'active-pink' : ''}`}
      >
        {enabled ? 'Désactiver le mode debug' : 'Activer le mode debug'}
      </button>
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
  fetchActivePlayersCount, fetchAdminPlayerList, deleteLeaderboardEntry,
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
    { key: 'banners', label: t('admin.tabs.banners'), active: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' },
    { key: 'collection', label: t('admin.tabs.collection'), active: 'bg-purple-500/10 text-purple-400 border border-purple-500/30' },
    { key: 'visuals', label: t('admin.tabs.visuals'), active: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' },
    { key: 'trophies', label: t('admin.tabs.trophies'), active: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
    { key: 'players', label: <><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />{t('admin.tabs.players')}</>, active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
    { key: 'echobg', label: t('admin.tabs.echobg'), active: 'bg-pink-500/10 text-pink-400 border border-pink-500/30' },
    { key: 'diag', label: t('admin.tabs.diag'), active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
    { key: 'debug', label: 'Debug', active: 'bg-pink-500/10 text-pink-400 border border-pink-500/30' },
  ];

  return (
    <>
      {/* Admin Panel Modal */}
      <FocusTrapModal isOpen={showAdminPanel && !adminMiniMode} onClose={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="" onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} ariaLabel="Admin panel" centered padding="p-3">
          <div className="kuro-card w-full max-w-2xl max-h-[90vh]" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="kuro-card-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <CardHeader action={<button onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label={t('admin.panel.closeAria')}><X size={16} /></button>}>
              <span className="flex items-center gap-2"><Settings size={16} /> {t('admin.panel.title')}</span>
            </CardHeader>
            <div className="kuro-body space-y-3" style={{ overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
              {!adminUnlocked ? (
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <p className="text-yellow-400 text-md font-medium">{t('admin.panel.accessRequired')}</p>
                    <p className="text-gray-400 text-sm mt-1">{t('admin.panel.enterPassword')}</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={t('admin.panel.passwordPlaceholder')}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && verifyAdminPassword()}
                      className="kuro-input flex-1 text-md"
                      aria-label={t('admin.panel.passwordAria')}
                      aria-invalid={adminLockedUntil > Date.now() ? true : undefined}
                      aria-describedby={adminLockedUntil > Date.now() ? 'admin-lockout-msg' : undefined}
                    />
                    <button onClick={verifyAdminPassword} className="kuro-btn px-4" aria-label={t('admin.panel.unlockAria')}>{t('admin.panel.unlock')}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-center">
                    <p className="text-emerald-400 text-base">{t('admin.panel.unlocked')}</p>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex gap-2 border-b border-[var(--border-medium)] pb-2 flex-wrap">
                    {ADMIN_TABS.map(({ key, label, active }) => (
                      <button
                        key={key}
                        onClick={() => setAdminTab(key)}
                        className={`px-3 py-1.5 rounded text-sm transition-all ${adminTab === key ? active : 'text-gray-400 hover:text-white border border-[var(--border-medium)]'}`}
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
                        <h3 className="text-purple-400 text-md font-medium mb-3">{t('admin.collectionTab.title')}</h3>
                        <p className="text-gray-400 text-sm mb-3">{t('admin.collectionTab.desc')}</p>
                        {(() => {
                          const allHistory = [
                            ...state.profile.featured.history,
                            ...state.profile.weapon.history,
                            ...(state.profile.standardChar?.history || []),
                            ...(state.profile.standardWeap?.history || [])
                          ];
                          const uniqueNames = [...new Set(allHistory.filter(p => p.rarity >= 4 && p.name).map(p => p.name))].sort();
                          if (uniqueNames.length === 0) {
                            return <div className="kuro-empty-state text-center py-4"><p className="text-gray-400 text-base">{t('admin.collectionTab.importPrompt')}</p><button onClick={() => setActiveTab('profile')} className="kuro-btn kuro-btn-primary text-sm mt-2 px-3 py-1.5">{t('admin.collectionTab.goToImport')}</button></div>;
                          }
                          return (
                            <div className="space-y-2 max-h-[256px] overflow-y-auto pr-2">
                              {uniqueNames.map(name => {
                                const hasDefault = DEFAULT_COLLECTION_IMAGES[name];
                                const hasCustom = customCollectionImages[name];
                                const displayUrl = collectionImages[name];
                                return (
                                  <div key={name} className="flex items-center gap-2">
                                    <span className={`text-sm w-32 truncate ${hasDefault ? 'text-gray-300' : 'text-yellow-400'}`} title={hasDefault ? name : t('admin.collectionTab.noDefault', { name })}>
                                      {name} {!hasDefault && '⚠'}
                                    </span>
                                    <input
                                      type="text"
                                      placeholder={hasDefault ? t('admin.collectionTab.usingDefault') : "https://i.ibb.co/..."}
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
                                      className={`kuro-input flex-1 text-sm py-1 ${hasCustom ? 'border-purple-500/50' : ''}`}
                                    />
                                    {displayUrl && (
                                      <img src={displayUrl} alt={name} className="w-[30px] h-[30px] object-cover rounded border border-purple-500/30" loading="lazy" onError={hideOnError} />
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
                          onClick={async () => { if (await confirm({ title: t('admin.collectionTab.clearOverridesTitle'), message: t('admin.collectionTab.clearOverridesMessage'), confirmLabel: t('admin.collectionTab.clearOverridesConfirm'), destructive: true })) saveCollectionImages({}); }}
                          className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-base hover:bg-red-500/30"
                        >
                          {t('admin.collectionTab.clearOverrides')}
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
                        <button onClick={() => setAdminMiniMode(true)} className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-base hover:bg-emerald-500/30">{t('admin.visualsTab.miniWindow')}</button>
                        <button onClick={async () => { if (await confirm({ title: t('admin.visualsTab.resetTitle'), message: t('admin.visualsTab.resetMessage'), confirmLabel: t('admin.visualsTab.resetConfirm'), destructive: true })) saveVisualSettings(DEFAULT_VISUAL_SETTINGS); }} className="flex-1 px-4 py-2 bg-neutral-700 text-gray-300 rounded text-base hover:bg-neutral-600">{t('admin.visualsTab.resetDefaults')}</button>
                      </div>
                    </div>
                  )}

                  {adminTab === 'players' && (
                    <AdminPlayersTab
                      activePlayersCount={activePlayersCount} activePlayersHistory={activePlayersHistory}
                      presenceError={presenceError} adminPlayerList={adminPlayerList}
                      fetchActivePlayersCount={fetchActivePlayersCount} fetchAdminPlayerList={fetchAdminPlayerList}
                      deleteLeaderboardEntry={deleteLeaderboardEntry}
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

                  {adminTab === 'debug' && <PaddingDebugTab />}

                  {adminTab === 'diag' && (() => {
                    let diag = null;
                    try { diag = JSON.parse(localStorage.getItem('ww-import-diagnostic')); } catch {}
                    return (
                      <div className="space-y-3">
                        <div className="text-base text-gray-400">{t('admin.diag.lastImport')}{diag?.timestamp ? ` — ${new Date(diag.timestamp).toLocaleString()}` : ''}</div>
                        {diag?.log ? (
                          <pre className="text-sm font-mono text-emerald-400 bg-black/40 p-3 rounded-lg whitespace-pre-wrap overflow-auto max-h-[40vh]">{diag.log}</pre>
                        ) : (
                          <div className="text-gray-400 text-base text-center py-4">{t('admin.diag.noLog')}</div>
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
                          }} className="kuro-btn w-full text-base">{t('admin.diag.download')}</button>
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

      {/* Admin Mini Window — rendered by App.jsx (hoisted so it persists across tab switches). */}
    </>
  );
}
