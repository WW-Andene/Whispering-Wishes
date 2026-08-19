// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/IconFiltersPopover.jsx (extracted from MapTab.jsx)
// Header-anchored "Icon filters" panel — builds a category → subcategory
// tree from the currently placed icons and lets the user toggle visibility
// per category/subcategory. Pure UI; iconFiltersOff state and the
// toggleIconFilter handler stay in MapTab.jsx (persisted to localStorage,
// also consumed by the map-render effect that filters visible icons).
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

export function IconFiltersPopover({
  panelRef,
  top,
  maxHeight,
  iconDrafts,
  getIconCatalogEntry,
  iconFiltersOff,
  toggleIconFilter,
  onClose,
}) {
  // Build a nested category → subcategory tree from the placed icons. A
  // subcategory count rolls up into its parent category. Keys use
  // "Category/Subcategory" form so iconFiltersOff can target either level;
  // a category-level hide cascades to all its subs via the render-time
  // filter.
  const tree = new Map(); // category → { total, subs: Map<sub, n> }
  for (const ic of iconDrafts) {
    const kind = getIconCatalogEntry(ic.kind);
    const cat = ic.category || kind?.category || 'Uncategorised';
    const sub = ic.subcategory || kind?.subcategory || '';
    if (!tree.has(cat)) tree.set(cat, { total: 0, subs: new Map() });
    const entry = tree.get(cat);
    entry.total++;
    if (sub) entry.subs.set(sub, (entry.subs.get(sub) || 0) + 1);
  }
  const cats = [...tree.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div
      ref={panelRef}
      className="map-filters-popover"
      role="dialog"
      aria-label="Icon filters"
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
          Icon filters
        </CardHeader>
        <CardBody className="map-filters-body">
          {cats.length === 0 ? (
            <div className="zone-selector-empty">
              No icons placed yet. Add icons from the editor panel.
            </div>
          ) : (
            <div className="map-filters-list">
              {cats.map(([cat, entry]) => {
                const catOff = iconFiltersOff.has(cat);
                const subs = [...entry.subs.entries()].sort((a, b) => a[0].localeCompare(b[0]));
                return (
                  <React.Fragment key={cat}>
                    <button
                      type="button"
                      className={`kuro-btn kuro-btn-sm zone-selector-item ${catOff ? '' : 'is-current'}`}
                      onClick={() => toggleIconFilter(cat)}
                      aria-pressed={!catOff}
                      title={catOff ? `Show ${cat}` : `Hide ${cat}`}
                    >
                      <span className="zone-selector-caret">{catOff ? '▢' : '▣'}</span>
                      <span className="zone-selector-name">{cat}</span>
                      <span className="kuro-badge kuro-badge-neutral" style={{ marginLeft: 'auto' }}>{entry.total}</span>
                    </button>
                    {subs.map(([sub, n]) => {
                      const key = `${cat}/${sub}`;
                      const subOff = iconFiltersOff.has(key);
                      // A subcategory is effectively hidden if its parent
                      // category is hidden — reflect that visually without
                      // persisting state.
                      const effectiveOff = catOff || subOff;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`kuro-btn kuro-btn-sm zone-selector-item ${effectiveOff ? '' : 'is-current'}`}
                          onClick={() => toggleIconFilter(key)}
                          aria-pressed={!effectiveOff}
                          disabled={catOff}
                          title={catOff
                            ? `Parent category "${cat}" is hidden`
                            : (subOff ? `Show ${sub}` : `Hide ${sub}`)}
                          style={{ paddingLeft: 'calc(var(--space-md, 12px) + var(--space-sm, 8px))' }}
                        >
                          <span className="zone-selector-caret">{effectiveOff ? '▢' : '▣'}</span>
                          <span className="zone-selector-name">{sub}</span>
                          <span className="kuro-badge kuro-badge-neutral" style={{ marginLeft: 'auto' }}>{n}</span>
                        </button>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
