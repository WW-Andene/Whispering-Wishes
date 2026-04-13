import React from 'react';
import { CardHeader } from '../../shared/components/Card.jsx';

export default function MapTab() {
  return (
    <div className="kuro-card">
      <div className="kuro-card-inner" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 12px - 80px)' }}>
        <CardHeader>Interactive Map</CardHeader>
        <div className="kuro-body" style={{ flex: 1 }}>
          <p className="text-gray-400 text-sm">Map goes here</p>
        </div>
        <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
      </div>
    </div>
  );
}
