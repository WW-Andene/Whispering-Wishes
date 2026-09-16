// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/assistant/AbbyAssistant.jsx
// Abby (the onboarding host) doubles as an in-app search assistant: shake the
// device to summon her, type a question, get matching characters/weapons/
// echoes, tap a result to open its detail modal. v1 scope is static game data
// only (see CLAUDE.md session note) - no user progression data indexed yet.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { useShakeDetection } from '../../hooks/useShakeDetection.js';
import { buildAssistantIndex, searchAssistant } from './searchIndex.js';
import { t, getLocale } from '../../utils/i18n.js';

const TYPE_LABEL_KEY = { character: 'assistant.typeCharacter', weapon: 'assistant.typeWeapon', echo: 'assistant.typeEcho' };

export function AbbyAssistant({ collectionImages, setDetailModal, setActiveTab }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useShakeDetection(() => setOpen(true));

  // Rebuilt only when the modal opens (not on every keystroke) and whenever
  // the app locale changes while it's open, so results stay in the language
  // the user is currently reading in.
  const locale = getLocale();
  const index = useMemo(() => (open ? buildAssistantIndex(locale) : null), [open, locale]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  const results = useMemo(() => (index ? searchAssistant(index, query) : []), [index, query]);

  function openResult(item) {
    setDetailModal({
      show: true,
      type: item.type,
      name: item.name,
      imageUrl: collectionImages[item.name] || null,
      framing: null,
      ...(item.type === 'echo' ? { cost: item.cost } : {}),
    });
    setOpen(false);
  }

  if (!open) return null;

  return (
    <FocusTrapModal isOpen={true} onClose={() => setOpen(false)} ariaLabel={t('assistant.welcome')} centered padding="p-3">
      <div className="kuro-card w-full max-w-xs">
        <div className="kuro-card-inner rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpen(false)}
            aria-label={t('assistant.close')}
            className="kuro-btn absolute top-3 right-4 z-20 min-h-[48px]"
            style={{ padding: '8px 14px', fontSize: 'var(--font-sm)' }}
          >
            ✕
          </button>

          <div className="kuro-body text-center flex flex-col items-center" style={{ paddingTop: '24px' }}>
            <img src="./misc-assets/Abby_Full_Sprite.png" alt="" aria-hidden="true" className="mx-auto w-48 h-32 object-contain object-bottom" />
            <div
              className="rounded-2xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 16px', marginTop: '-8px' }}
            >
              <p style={{ color: 'var(--text-heading)', fontSize: 'var(--font-sm)' }}>{t('assistant.welcome')}</p>
            </div>
          </div>

          <div style={{ padding: 'var(--card-padding)' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('assistant.placeholder')}
              className="kuro-input w-full text-base"
              autoComplete="off"
            />

            {query.trim() && (
              <div className="mt-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: '256px' }}>
                {results.length === 0 && (
                  <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', padding: '16px 0' }}>
                    {t('assistant.noResults')}
                  </p>
                )}
                {results.map((item) => {
                  const img = collectionImages[item.name];
                  return (
                    <button
                      key={item.id}
                      onClick={() => openResult(item)}
                      className="kuro-btn w-full flex items-center gap-3 text-left min-h-[48px]"
                      style={{ padding: '6px 12px' }}
                    >
                      {img ? (
                        <img src={img} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: 'var(--border-subtle)' }} />
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block truncate" style={{ color: 'var(--text-heading)', fontSize: 'var(--font-sm)' }}>{item.name}</span>
                        <span className="block truncate" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                          {t(TYPE_LABEL_KEY[item.type])}{item.subtitle ? ` · ${item.subtitle}` : ''}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </FocusTrapModal>
  );
}
