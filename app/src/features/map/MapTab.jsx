import React from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

export default function MapTab() {
  return (
    <Card>
      <CardHeader>Interactive Map</CardHeader>
      <CardBody className="space-y-2">
        {Array.from({ length: 10 }, (_, i) => (
          <Card key={i}>
            <CardBody>
              <p className="text-gray-500 text-sm">Card {i + 1}</p>
            </CardBody>
          </Card>
        ))}
      </CardBody>
      <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
    </Card>
  );
}
