import React, { useEffect } from 'react';
import { CardHeader } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';

export default function MapTab({ navPadding = 80 }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" tabIndex="0">
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="map" />

      <div className="kuro-card" style={{ height: `calc(100dvh - ${navPadding}px)`, overflow: 'hidden' }}>
        <div className="kuro-card-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>Interactive Map</CardHeader>
          <div className="kuro-body" style={{ flex: 1, overflow: 'hidden' }}>
            <p className="text-gray-400 text-sm">Map goes here</p>
          </div>
          <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
        </div>
      </div>

    </div>
    </div>
  );
}
