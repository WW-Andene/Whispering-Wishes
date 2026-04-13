import React from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

export default function MapTab() {
  return (
    <Card>
      <CardHeader>Interactive Map</CardHeader>
      <CardBody>
        <p className="text-gray-400 text-sm">Map goes here</p>
      </CardBody>
      <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
    </Card>
  );
}
