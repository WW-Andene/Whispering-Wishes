// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — ProfilePicturePickerModal (extracted alongside IdCardModal,
// same "extracted from ProfileTab" pattern that file's own header established)
// Tapping the Profile Picture box in Resonator Profile opens this — a searchable
// grid of owned Resonators, same "Kuro panel" shell (FocusTrapModal + kuro-card)
// EchoFarmPlanner's echo picker and IdCardModal's own Resonators grid already use,
// so this reads as the same app-wide picker pattern rather than a one-off. Tapping
// an entry calls the same handleSetProfilePic the Collection tab's crown button and
// the ID Card's own picker already use, so all three stay in sync automatically.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Check, Crown, Search, X } from 'lucide-react';
import { CHARACTER_DATA } from '../../data/characters.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { t } from '../../utils/i18n.js';

export default function ProfilePicturePickerModal({ isOpen, onClose, ownedCharNames, collectionImages, profilePic, onSelect, getImageFraming }) {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;

  const filtered = ownedCharNames.filter(name => !search || name.toLowerCase().includes(search.toLowerCase()));

  return (
    <FocusTrapModal isOpen onClose={onClose} className="" onClick={onClose} centered padding="p-3" ariaLabel={t('profile.resonator.choosePicture')}>
      <div className="kuro-card w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]">
          <h3 className="text-white text-xl font-semibold">{t('profile.resonator.choosePicture')}</h3>
          <button onClick={onClose} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t('planner.closeLabel')}><X size={16} /></button>
        </div>
        {ownedCharNames.length > 0 && (
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <div className="relative">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('profile.resonator.searchResonators')} className="kuro-input w-full pl-8 text-base" autoFocus />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-3">
          {ownedCharNames.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6">{t('profile.resonator.noOwnedResonators')}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6">{t('planner.echoFarm.noOptionsLeft')}</div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {filtered.map(name => {
                const imgUrl = collectionImages[name];
                const f = getImageFraming(`collection-${name}`);
                const is5Star = CHARACTER_DATA[name]?.rarity === 5;
                const isSelected = profilePic === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => { onSelect(name); onClose(); }}
                    aria-label={t('profile.idCard.setAsIcon', { name })}
                    aria-pressed={isSelected}
                    title={t('profile.idCard.setAsIcon', { name })}
                  >
                    <div className={`relative rounded-lg overflow-hidden w-full kuro-avatar-frame kuro-shadow-card-subtle${is5Star ? ' holo-5star' : ''}`} style={{ aspectRatio: '9/14', border: isSelected ? '1px solid #edaf18' : '1px solid var(--border-medium)', boxShadow: isSelected ? '0 0 8px rgba(237,175,24,0.4)' : undefined }}>
                      {imgUrl ? (
                        <div className="absolute inset-0"><img src={imgUrl} alt={name} loading="lazy" className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} onError={hideOnError} /></div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500" style={{ fontSize: 'var(--font-md)' }}>{name[0]}</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-1 pointer-events-none idcard-img-fade--strong">
                        <span className="text-gray-200 text-center truncate block kuro-tshadow-micro" style={{ fontSize: '8px' }}>{name}</span>
                      </div>
                      {isSelected ? (
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center"><Check size={10} className="text-black" /></div>
                      ) : (
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}><Crown size={10} className="text-gray-300" /></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FocusTrapModal>
  );
}
