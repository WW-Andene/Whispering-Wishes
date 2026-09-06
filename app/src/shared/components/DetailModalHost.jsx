// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/DetailModalHost.jsx (extracted from App.jsx)
// Renders the character/weapon/echo detail modal matching detailModal.type.
// ═══════════════════════════════════════════════════════════════════════════════

import { CharacterDetailModal } from '../modals/CharacterDetailModal.jsx';
import { WeaponDetailModal } from '../modals/WeaponDetailModal.jsx';
import { EchoDetailModal } from '../modals/EchoDetailModal.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';

export function DetailModalHost({ detailModal, setDetailModal, visualSettings, setActiveTab, collectionData }) {
  const { getImageFraming } = useImageFramingContext();

  if (!detailModal.show) return null;

  if (detailModal.type === 'character') {
    return (
      <CharacterDetailModal
        name={detailModal.name}
        imageUrl={detailModal.imageUrl}
        framing={detailModal.framing}
        infoFraming={getImageFraming(`info-${detailModal.name}`)}
        visualSettings={visualSettings}
        onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null, framing: null })}
        onViewInTeams={() => {
          // P-FIX: "View in Team Builder" must only navigate — it silently added the
          // character to the active team's first empty slot before, contradicting its
          // own label and equipping resonators the user only meant to look up.
          setDetailModal({ show: false, type: null, name: null, imageUrl: null, framing: null });
          setActiveTab('teams');
        }}
        collectionData={collectionData}
      />
    );
  }

  if (detailModal.type === 'weapon') {
    return (
      <WeaponDetailModal
        name={detailModal.name}
        imageUrl={detailModal.imageUrl}
        infoFraming={getImageFraming(`info-${detailModal.name}`)}
        visualSettings={visualSettings}
        onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null })}
        collectionData={collectionData}
      />
    );
  }

  if (detailModal.type === 'echo') {
    return (
      <EchoDetailModal
        name={detailModal.name}
        imageUrl={detailModal.imageUrl}
        cost={detailModal.cost}
        infoFraming={getImageFraming(`info-${detailModal.name}`)}
        visualSettings={visualSettings}
        onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null })}
        collectionData={collectionData}
      />
    );
  }

  return null;
}
