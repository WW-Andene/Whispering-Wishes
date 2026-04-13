import React from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';

export default function MapTab({ navPadding = 80 }) {
  return (
    <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" tabIndex="0">
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="map" />

      <Card style={{ height: `calc(100dvh - ${navPadding}px - 12px)`, overflow: 'hidden' }}>
        <CardHeader>Interactive Map</CardHeader>
        <CardBody>
          <p className="text-gray-400 text-sm">Map goes here</p>
        </CardBody>
        <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
      </Card>

    </div>
    </div>
  );
}
