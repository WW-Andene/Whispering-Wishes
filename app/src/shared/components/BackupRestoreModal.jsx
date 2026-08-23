// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/BackupRestoreModal.jsx (extracted from App.jsx)
// Backup export (copy/download) + restore-from-pasted-JSON + pre-import-backup
// recovery. Pure UI + handlers; all app state lives in App.jsx and is passed in.
// ═══════════════════════════════════════════════════════════════════════════════

import { Download, X } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { APP_VERSION, MAX_IMPORT_SIZE_MB } from '../../data/constants.js';
import { VISUAL_SETTINGS_KEY, IMAGE_FRAMING_KEY, TROPHY_OVERRIDES_KEY } from '../constants/appConstants.js';
import { COLLECTION_IMAGES_KEY } from '../../hooks/useCollectionImages.js';
import { t, formatDate } from '../../utils/i18n.js';

export function BackupRestoreModal({
  isOpen,
  exportData,
  restoreText,
  setRestoreText,
  onClose,
  toast,
  confirm,
  dispatch,
  stateRef,
  sanitizeStateObj,
  sanitizeImportedState,
  initialState,
  setVisualSettings,
  setImageFraming,
  setCustomCollectionImages,
  setTrophyOverrides,
}) {
  return (
    <FocusTrapModal isOpen={isOpen} onClose={onClose} className="" onClick={onClose} ariaLabel={t('modals.backupRestore.ariaLabel')} centered padding="p-3">
      <div className="kuro-card w-full sm:max-w-sm rounded-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col" style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)] flex-shrink-0" data-sheet-header>
          <div className="flex items-center gap-2">
            <Download size={14} className="text-yellow-400" />
            <span className="text-white text-xl font-semibold">{t('modals.backupRestore.title')}</span>
          </div>
          <button onClick={onClose} className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all" aria-label={t('modals.backupRestore.closeAriaLabel')}><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          <p className="text-gray-400 text-sm">{t('modals.backupRestore.exportInstructions')}</p>
          <textarea
            value={exportData}
            readOnly
            className="kuro-input w-full h-24 text-sm font-mono"
            onClick={e => e.target.select()}
            aria-label={t('modals.backupRestore.exportTextareaAriaLabel')}
          />
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportData);
                toast?.addToast?.(t('modals.backupRestore.copiedSuccess'), 'success');
              } catch {
                // P6-FIX: Fallback uses Blob + clipboard API instead of deprecated execCommand (HIGH-17)
                try {
                  const blob = new Blob([exportData], { type: 'text/plain' });
                  await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
                  toast?.addToast?.(t('modals.backupRestore.copiedSuccess'), 'success');
                } catch {
                  toast?.addToast?.(t('modals.backupRestore.copyFailed'), 'error');
                }
              }
            }}
            className="kuro-btn w-full"
          >
            {t('modals.backupRestore.copyToClipboard')}
          </button>
          <button
            onClick={() => {
              try {
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `whispering-wishes-backup-${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 100);
                toast?.addToast?.(t('modals.backupRestore.downloadSuccess'), 'success');
              } catch {
                toast?.addToast?.(t('modals.backupRestore.downloadFailed'), 'error');
              }
            }}
            className="kuro-btn w-full flex items-center justify-center gap-2"
          >
            <Download size={14} /> {t('modals.backupRestore.downloadJson')}
          </button>

          <div className="relative my-1">
            <div className="kuro-divider" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 px-2 text-sm text-gray-400 uppercase tracking-wider">{t('modals.backupRestore.restoreDivider')}</span>
          </div>

          <p className="text-gray-400 text-sm">{t('modals.backupRestore.restoreInstructions')}</p>
          <textarea
            value={restoreText}
            onChange={(e) => setRestoreText(e.target.value)}
            placeholder={t('modals.backupRestore.restoreTextareaPlaceholder')}
            className="kuro-input w-full h-24 text-sm font-mono"
            aria-label={t('modals.backupRestore.restoreTextareaAriaLabel')}
          />
          <button
            onClick={async () => {
              if (!restoreText.trim()) {
                toast?.addToast?.(t('modals.backupRestore.pasteFirst'), 'error');
                return;
              }
              // P9-FIX: Size limit check for pasted backup data (Step 4 audit)
              if (restoreText.length > MAX_IMPORT_SIZE_MB * 1024 * 1024) {
                toast?.addToast?.(t('modals.backupRestore.backupTooLarge', { size: (restoreText.length / 1024 / 1024).toFixed(1), max: MAX_IMPORT_SIZE_MB }), 'error');
                return;
              }
              try {
                const data = JSON.parse(restoreText);
                if (!data || typeof data !== 'object' || !data.state || typeof data.state !== 'object') {
                  toast?.addToast?.(t('modals.backupRestore.invalidBackupFormat'), 'error');
                  return;
                }

                // Schema validation: check critical fields exist and have correct types
                const s = data.state;
                if (s.profile && typeof s.profile !== 'object') {
                  toast?.addToast?.(t('modals.backupRestore.invalidProfileField'), 'error');
                  return;
                }
                if (s.calc && typeof s.calc !== 'object') {
                  toast?.addToast?.(t('modals.backupRestore.invalidCalcField'), 'error');
                  return;
                }
                if (s.bookmarks && !Array.isArray(s.bookmarks)) {
                  toast?.addToast?.(t('modals.backupRestore.invalidBookmarksField'), 'error');
                  return;
                }
                if (s.profile?.featured?.history && !Array.isArray(s.profile.featured.history)) {
                  toast?.addToast?.(t('modals.backupRestore.invalidHistoryField'), 'error');
                  return;
                }

                // Version check warning
                const backupVersion = data.version || 'unknown';
                const pullCount = (s.profile?.featured?.history?.length || 0) + (s.profile?.weapon?.history?.length || 0) + (s.profile?.standardChar?.history?.length || 0) + (s.profile?.standardWeap?.history?.length || 0);

                // Auto-save pre-restore backup to localStorage for recovery
                try {
                  const preRestoreBackup = JSON.stringify({ timestamp: new Date().toISOString(), version: APP_VERSION, state: stateRef.current, _preRestore: true });
                  localStorage.setItem('whispering-wishes-pre-restore-backup', preRestoreBackup);
                } catch {} // best-effort - don't block restore if backup fails

                // Confirmation dialog
                const confirmed = await confirm({
                  title: t('modals.backupRestore.confirmRestoreTitle', { version: backupVersion }),
                  message: t('modals.backupRestore.confirmRestoreMessage', { pullCount, bookmarkCount: s.bookmarks?.length || 0 }),
                  confirmLabel: t('modals.backupRestore.confirmRestoreLabel'),
                  destructive: true,
                });
                if (!confirmed) return;

                // P10-FIX: Sanitize all nested objects to prevent prototype pollution (matches loadFromStorage pattern)
                const safeParsed = sanitizeStateObj(s);
                const restoredState = {
                  ...initialState,
                  ...sanitizeImportedState(safeParsed),
                  server: safeParsed.server || initialState.server,
                  profile: {
                    ...initialState.profile,
                    ...(safeParsed.profile ? sanitizeStateObj(safeParsed.profile) : {}),
                    featured: { ...initialState.profile.featured, ...(safeParsed.profile?.featured ? sanitizeStateObj(safeParsed.profile.featured) : {}) },
                    weapon: { ...initialState.profile.weapon, ...(safeParsed.profile?.weapon ? sanitizeStateObj(safeParsed.profile.weapon) : {}) },
                    standardChar: { ...initialState.profile.standardChar, ...(safeParsed.profile?.standardChar ? sanitizeStateObj(safeParsed.profile.standardChar) : {}) },
                    standardWeap: { ...initialState.profile.standardWeap, ...(safeParsed.profile?.standardWeap ? sanitizeStateObj(safeParsed.profile.standardWeap) : {}) },
                    beginner: { ...initialState.profile.beginner, ...(safeParsed.profile?.beginner ? sanitizeStateObj(safeParsed.profile.beginner) : {}) },
                  },
                  calc: { ...initialState.calc, ...safeParsed.calc },
                  planner: { ...initialState.planner, ...safeParsed.planner },
                  settings: { ...initialState.settings, ...safeParsed.settings },
                  bookmarks: Array.isArray(safeParsed.bookmarks) ? safeParsed.bookmarks : [],
                };
                dispatch({ type: 'LOAD_STATE', state: restoredState });
                // Restore auxiliary localStorage data if present in backup
                if (data.aux && typeof data.aux === 'object') {
                  try {
                    if (data.aux.visualSettings && typeof data.aux.visualSettings === 'object') {
                      localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(sanitizeStateObj(data.aux.visualSettings)));
                      setVisualSettings(prev => {
        const merged = { ...prev, ...sanitizeStateObj(data.aux.visualSettings) };
        if (typeof merged.collectionZoom === 'number') merged.collectionZoom = Math.min(300, Math.max(100, merged.collectionZoom));
        return merged;
      });
                    }
                    if (data.aux.imageFraming && typeof data.aux.imageFraming === 'object') {
                      localStorage.setItem(IMAGE_FRAMING_KEY, JSON.stringify(sanitizeStateObj(data.aux.imageFraming)));
                      setImageFraming(sanitizeStateObj(data.aux.imageFraming));
                    }
                    if (data.aux.collectionImages && typeof data.aux.collectionImages === 'object') {
                      localStorage.setItem(COLLECTION_IMAGES_KEY, JSON.stringify(sanitizeStateObj(data.aux.collectionImages)));
                      setCustomCollectionImages(sanitizeStateObj(data.aux.collectionImages));
                    }
                    if (data.aux.trophyOverrides && typeof data.aux.trophyOverrides === 'object') {
                      localStorage.setItem(TROPHY_OVERRIDES_KEY, JSON.stringify(sanitizeStateObj(data.aux.trophyOverrides)));
                      setTrophyOverrides(sanitizeStateObj(data.aux.trophyOverrides));
                    }
                    if (data.aux.teamEquipment && typeof data.aux.teamEquipment === 'object') {
                      localStorage.setItem('ww-team-equipment', JSON.stringify(sanitizeStateObj(data.aux.teamEquipment)));
                    }
                    // U6-01: Restore calendar notes from backup
                    if (data.aux.calendarNotes && typeof data.aux.calendarNotes === 'object') {
                      localStorage.setItem('ww-calendar-notes', JSON.stringify(sanitizeStateObj(data.aux.calendarNotes)));
                    }
                  } catch {}
                }
                toast?.addToast?.(t('modals.backupRestore.restoredSuccess', { version: backupVersion }), 'success');
                setRestoreText('');
                onClose();
              } catch (e) {
                toast?.addToast?.(t('modals.backupRestore.invalidJson', { message: e.message }), 'error');
              }
            }}
            disabled={!restoreText.trim()}
            className={`kuro-btn w-full ${restoreText.trim() ? '' : 'opacity-50'}`}
          >
            {t('modals.backupRestore.restoreButton')}
          </button>
          {/* P15-FIX: LOW-11 - UI to restore pre-import backup from localStorage */}
          {(() => {
            try { return !!localStorage.getItem('whispering-wishes-pre-import-backup'); } catch { return false; }
          })() && (
            <button
              onClick={async () => {
                try {
                  const raw = localStorage.getItem('whispering-wishes-pre-import-backup');
                  if (!raw) { toast?.addToast?.(t('modals.backupRestore.noPreImportBackup'), 'error'); return; }
                  const data = JSON.parse(raw);
                  if (!data?.state || typeof data.state !== 'object') { toast?.addToast?.(t('modals.backupRestore.invalidPreImportBackup'), 'error'); return; }
                  if (!await confirm({ title: t('modals.backupRestore.confirmPreImportTitle'), message: t('modals.backupRestore.confirmPreImportMessage', { date: data.timestamp ? formatDate(new Date(data.timestamp), { dateStyle: 'medium', timeStyle: 'short' }) : t('modals.backupRestore.unknownDate') }), confirmLabel: t('modals.backupRestore.confirmPreImportLabel'), destructive: true })) return;
                  dispatch({ type: 'LOAD_STATE', state: data.state });
                  toast?.addToast?.(t('modals.backupRestore.preImportRestoredSuccess'), 'success');
                  onClose();
                } catch (e) { toast?.addToast?.(t('modals.backupRestore.restoreFailed', { message: e.message }), 'error'); }
              }}
              className="kuro-btn w-full text-sm mt-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              {t('modals.backupRestore.restorePreImportButton')}
            </button>
          )}
        </div>
      </div>
    </FocusTrapModal>
  );
}
