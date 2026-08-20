// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ServerSelectorModal.jsx (extracted from App.jsx)
// Server region picker modal.
// ═══════════════════════════════════════════════════════════════════════════════

import { FocusTrapModal } from './FocusTrapModal.jsx';
import { t } from '../../utils/i18n.js';

export function ServerSelectorModal({ isOpen, onClose, servers, currentServer, onSelectServer }) {
  return (
    <FocusTrapModal isOpen={isOpen} onClose={onClose} className="" onClick={onClose} ariaLabel={t('modals.serverSelector.ariaLabel')} centered>
      <div className="kuro-card w-full max-w-[200px] rounded-2xl py-2" style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-semibold text-base px-4 py-2.5 border-b border-[var(--border-medium)]">{t('modals.serverSelector.heading')}</h3>
        {Object.keys(servers).map(s => (
          <button key={s} onClick={() => onSelectServer(s)} className={`w-full text-left px-4 py-2.5 text-base transition-colors ${s === currentServer ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>
    </FocusTrapModal>
  );
}
