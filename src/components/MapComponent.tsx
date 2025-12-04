'use client';

import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PollingStation } from '@/types/data';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.setIcon(DefaultIcon);

interface MapComponentProps {
  pollingStations: PollingStation[];
}

export default function MapComponent({ pollingStations }: MapComponentProps) {
  // Center on Nedungadu, Puducherry (average of coordinates)
  const center: [number, number] = [10.981, 79.816];

  return (
    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {pollingStations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="p-3 w-64">
                <h3 className="font-bold text-sm mb-1">{station.ps_name}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>PS No:</strong> {station.ps_no}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Locality:</strong> {station.locality}
                </p>
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs font-semibold text-blue-600 mb-1">2021 Election Results:</p>
                  {station.election2021 && (
                    <div className="text-xs space-y-1">
                      {Object.entries(station.election2021.candidates).map(([candidate, votes]) => (
                        <p key={candidate} className="text-gray-700">
                          {candidate}: {(votes as number).toFixed(2)}%
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
