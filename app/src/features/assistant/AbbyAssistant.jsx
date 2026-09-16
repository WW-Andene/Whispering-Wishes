// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/assistant/AbbyAssistant.jsx
// Abby (the onboarding host) doubles as an in-app search assistant: shake the
// device to summon her, type a question, get matching characters/weapons/
// echoes, tap a result to open its detail modal. v1 scope is static game data
// only (see CLAUDE.md session note) - no user progression data indexed yet.
//
// Styled as a floating AI-overlay (glass bubble + pill search, no dim scrim,
// no boxed card) rather than a centered modal dialog, per explicit direction.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { useShakeDetection } from '../../hooks/useShakeDetection.js';
import { buildAssistantIndex, searchAssistant } from './searchIndex.js';
import { t, getLocale } from '../../utils/i18n.js';

const TYPE_LABEL_KEY = { character: 'assistant.typeCharacter', weapon: 'assistant.typeWeapon', echo: 'assistant.typeEcho' };

const GLASS_PANEL_STYLE = {
  background: 'var(--bg-elevated)',
  backdropFilter: 'blur(var(--blur-lg))',
  WebkitBackdropFilter: 'blur(var(--blur-lg))',
  border: '1px solid var(--border-subtle)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};

export function AbbyAssistant({ collectionImages, setDetailModal, setActiveTab }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useShakeDetection(() => setOpen(true));

  // Rebuilt only when the overlay opens (not on every keystroke) and whenever
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
    <FocusTrapModal
      isOpen={true}
      onClose={() => setOpen(false)}
      ariaLabel={t('assistant.welcome')}
      dim={false}
      padding="p-3"
      onClick={() => setOpen(false)}
    >
      {/* stopPropagation so tapping the floating content itself doesn't
          trigger the backdrop's tap-outside-to-close */}
      <div className="w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: '8px' }}>

        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setOpen(false)}
            aria-label={t('assistant.close')}
            className="absolute flex items-center justify-center"
            style={{
              top: '-8px', right: '-8px', width: '32px', height: '32px', borderRadius: '9999px',
              ...GLASS_PANEL_STYLE, color: 'var(--text-muted)', fontSize: 'var(--font-sm)', zIndex: 1,
            }}
          >
            ✕
          </button>
          <div className="rounded-2xl" style={{ ...GLASS_PANEL_STYLE, padding: '8px 16px', marginBottom: '-8px' }}>
            <p style={{ color: 'var(--text-heading)', fontSize: 'var(--font-sm)' }}>{t('assistant.welcome')}</p>
          </div>
          <img
            src="./misc-assets/Abby_Full_Sprite.png"
            alt=""
            aria-hidden="true"
            className="w-48 h-32 object-contain object-bottom"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' }}
          />
        </div>

        {query.trim() && (
          <div className="w-full rounded-2xl overflow-y-auto" style={{ ...GLASS_PANEL_STYLE, maxHeight: '256px', padding: '6px' }}>
            {results.length === 0 && (
              <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', padding: '16px 0' }}>
                {t('assistant.noResults')}
              </p>
            )}
            <div className="space-y-1.5">
              {results.map((item) => {
                const img = collectionImages[item.name];
                return (
                  <button
                    key={item.id}
                    onClick={() => openResult(item)}
                    className="w-full flex items-center gap-3 text-left rounded-xl min-h-[48px] transition-colors hover:bg-white/5 active:bg-white/10"
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
          </div>
        )}

        <div className="w-full flex items-center gap-2 rounded-full" style={{ ...GLASS_PANEL_STYLE, padding: '8px 16px' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('assistant.placeholder')}
            className="flex-1 min-w-0 bg-transparent outline-none border-0 text-base"
            style={{ color: 'var(--text-heading)' }}
            autoComplete="off"
          />
        </div>
      </div>
    </FocusTrapModal>
  );
}
