import React from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';

export default function MapTab() {
  return (
    <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" tabIndex="0">
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="map" />

      <Card>
        <CardHeader>Interactive Map</CardHeader>
        <CardBody className="space-y-2">
          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 text-base font-medium">Weekly Progress</span>
              <span className="text-yellow-400 font-bold text-xl kuro-number">1,200 / 2,400 Astrite</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-400 rounded-l-full" style={{ width: '50%' }} />
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">5/10 done</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="kuro-stat kuro-stat-emerald flex-1 p-2">
              <div className="text-emerald-400 text-xl font-bold kuro-number">5</div>
              <div className="text-gray-500 kuro-micro-label">Completed</div>
            </div>
            <div className="kuro-stat kuro-stat-gold flex-1 p-2">
              <div className="text-yellow-400 text-xl font-bold kuro-number">3</div>
              <div className="text-gray-500 kuro-micro-label">Pending</div>
            </div>
            <div className="kuro-stat kuro-stat-gray flex-1 p-2">
              <div className="text-gray-400 text-xl font-bold kuro-number">2</div>
              <div className="text-gray-500 kuro-micro-label">Skipped</div>
            </div>
          </div>

          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="p-3 rounded-lg border border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Event {i + 1}</span>
                <span className="text-emerald-400 text-sm">Active</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">Placeholder event description</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(i + 1) * 15}%` }} />
                </div>
                <span className="text-gray-500 text-xs">{(i + 1) * 15}%</span>
              </div>
            </div>
          ))}
        </CardBody>
        <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
      </Card>

    </div>
    </div>
  );
}
