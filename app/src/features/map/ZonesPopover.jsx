// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/ZonesPopover.jsx (extracted from MapTab.jsx)
// Header-anchored "Regions" panel — a tree of canonical + draft zones with
// expand/collapse and arm-then-fire fly-to-zone navigation. Pure UI; state
// and map interaction handlers stay in MapTab.jsx (fly-to needs the live
// Leaflet map instance, which this component has no reason to hold).
// ═══════════════════════════════════════════════════════════════════════════════

import { LocateFixed, Pen } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { t } from '../../utils/i18n.js';

export function ZonesPopover({
  panelRef,
  top,
  maxHeight,
  zoneNav,
  expandedZones,
  currentZoneId,
  pendingZoneId,
  setPendingZoneId,
  pendingZoneTimerRef,
  zoneArmMs,
  authorMode,
  toggleZoneExpanded,
  onFlyToZone,
  onPushSubMapToEdit,
  showToast,
  onClose,
}) {
  const renderNode = (zone, depth) => {
    const children = zoneNav.get(zone.id) || [];
    const hasChildren = children.length > 0;
    const expanded = expandedZones.has(zone.id);
    // Indent by level (L1 → 0, L2 → 1 unit, …),
    // falling back to tree depth when level is unset.
    const indentLevel = (zone.level != null ? zone.level - 1 : depth);
    const isCurrent = zone.id === currentZoneId;
    return (
      <div key={zone.id} role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
        <div className="zone-selector-row" style={{ paddingLeft: `calc(${indentLevel} * var(--space-md, 12px))` }}>
          <button
            type="button"
            className={`kuro-btn kuro-btn-sm zone-selector-item ${!hasChildren && pendingZoneId === zone.id ? 'is-armed' : ''} ${isCurrent ? 'is-current' : ''}`}
            onClick={() => {
              if (hasChildren) {
                // L1 parent: single click toggles expand;
                // the LocateFixed icon on the right fires
                // fly-to separately.
                toggleZoneExpanded(zone.id);
                return;
              }
              // L2 leaf: arm-then-fire. No icon for these;
              // second tap on the same zone within
              // ZONE_ARM_MS fires onFlyToZone.
              if (pendingZoneId === zone.id) {
                if (pendingZoneTimerRef.current) clearTimeout(pendingZoneTimerRef.current);
                setPendingZoneId(null);
                onFlyToZone(zone);
                return;
              }
              setPendingZoneId(zone.id);
              if (pendingZoneTimerRef.current) clearTimeout(pendingZoneTimerRef.current);
              pendingZoneTimerRef.current = setTimeout(() => setPendingZoneId(null), zoneArmMs);
              showToast(`Tap again to open ${zone.name || zone.id}`, zoneArmMs);
            }}
            aria-label={hasChildren ? `${zone.name || zone.id} — ${expanded ? 'collapse' : 'expand'}` : `${zone.name || zone.id} — tap again to open`}
            aria-current={isCurrent ? 'location' : undefined}
            title={hasChildren ? (expanded ? 'Collapse' : 'Expand') : 'Tap · Tap again to open'}
          >
            <span className="zone-selector-caret">{hasChildren ? (expanded ? '▾' : '▸') : '·'}</span>
            <span className="zone-selector-name">{zone.name || zone.id}</span>
          </button>
          {hasChildren && (
            <button
              type="button"
              className="kuro-btn kuro-btn-sm kuro-btn-icon"
              onClick={() => onFlyToZone(zone)}
              aria-label={`Go to ${zone.name || zone.id}`}
              title={`Go to ${zone.name || zone.id}`}
            >
              <LocateFixed size={14} />
            </button>
          )}
          {zone.overlayId && authorMode && (
            <button
              type="button"
              className="kuro-btn kuro-btn-sm kuro-btn-icon"
              onClick={(e) => { e.stopPropagation(); onPushSubMapToEdit(zone); }}
              aria-label={`Push "${zone.name || zone.id}" back to sub-map editor`}
              title="Push back to sub-map editor"
            >
              <Pen size={14} />
            </button>
          )}
        </div>
        {hasChildren && expanded && (
          <div role="group">
            {children.map(c => renderNode(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const roots = zoneNav.get(null) || [];

  return (
    <div
      ref={panelRef}
      className="map-zones-popover"
      role="dialog"
      aria-label="Zones"
      onClick={(e) => e.stopPropagation()}
      style={{ top: `${top}px`, maxHeight }}
    >
      <Card>
        <CardHeader
          action={
            <button
              type="button"
              className="kuro-btn kuro-btn-sm kuro-btn-icon"
              onClick={onClose}
              aria-label="Close"
            >✕</button>
          }
        >
          Regions
        </CardHeader>
        <CardBody className="map-zones-body">
          {roots.length === 0
            ? <div className="zone-selector-empty">{t('map.zonesPopover.noZones')}</div>
            : roots.map(z => renderNode(z, 0))}
        </CardBody>
      </Card>
    </div>
  );
}
