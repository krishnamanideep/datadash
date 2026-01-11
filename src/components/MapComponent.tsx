'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PollingStation } from '@/types/data';
import L from 'leaflet';

interface MapComponentProps {
  data: PollingStation[];
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ data }: MapComponentProps) {
  const [icons, setIcons] = useState<{ [key: string]: unknown } | null>(null);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      
      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const orangeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      
      setIcons({ blue: blueIcon, red: redIcon, green: greenIcon, orange: orangeIcon });
    }
  }, []);

  // Calculate center based on data
  const { center, zoom } = useMemo(() => {
    if (data && data.length > 0) {
      const validBooths = data.filter(b => b.latitude && b.longitude);
      if (validBooths.length > 0) {
        const avgLat = validBooths.reduce((sum, b) => sum + b.latitude, 0) / validBooths.length;
        const avgLon = validBooths.reduce((sum, b) => sum + b.longitude, 0) / validBooths.length;
        return { center: [avgLat, avgLon] as [number, number], zoom: 13 };
      }
    }
    return { center: [11.9416, 79.8083] as [number, number], zoom: 11 };
  }, [data]);

  const getMarkerIcon = (booth: PollingStation) => {
    if (!icons) return null;
    
    // Color code by top party
    const party = booth.strongestParty?.toUpperCase();
    if (party?.includes('BJP')) return icons.orange;
    if (party?.includes('DMK')) return icons.red;
    if (party?.includes('AIADMK')) return icons.green;
    return icons.blue;
  };
  
  if (!icons) {
    return <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">Loading map...</div>;
  }

  const validBooths = data.filter(booth => booth.latitude && booth.longitude);

  return (
    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        className="z-10"
        scrollWheelZoom={true}
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Assembly boundary circle */}
        {validBooths.length > 0 && (
          <Circle
            center={center}
            radius={3000}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        )}

        {/* Polling station markers */}
        {validBooths.map((booth, idx) => {
          const markerIcon = getMarkerIcon(booth);
          if (!markerIcon) return null;
          
          return (
            <Marker
              key={idx}
              position={[booth.latitude, booth.longitude]}
              icon={markerIcon as any}
            >
              <Popup maxWidth={300}>
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-2 text-gray-800">{booth.locality}</h3>
                  <div className="text-xs text-gray-600 mb-3 border-b pb-2">
                    {booth.ps_no}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-purple-700">Category:</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        booth.category === 'A' ? 'bg-green-100 text-green-800' :
                        booth.category === 'B' ? 'bg-blue-100 text-blue-800' :
                        booth.category === 'C' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booth.category || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-700">Leading Party:</span>
                      <span className="font-bold text-sm">{booth.strongestParty || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="border-t pt-2 mt-3">
                    <p className="text-xs font-semibold text-blue-700 mb-2">2021 Election Results:</p>
                    <div className="space-y-1">
                      {booth.election2021?.candidates && Object.entries(booth.election2021.candidates).map(([party, votes]) => (
                        <div key={party} className="flex justify-between">
                          <span className="text-xs text-gray-700">{party}:</span>
                          <span className="text-xs font-semibold text-blue-600">
                            {votes}
                          </span>
                        </div>
                      ))}
                      {/* Turnout calculation can be added if voter data is available */}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000] text-xs">
        <div className="font-bold mb-2">Party Markers</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>BJP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>DMK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>AIADMK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Others</span>
          </div>
        </div>
        <div className="border-t mt-2 pt-2">
          <div className="font-semibold">{validBooths.length} Polling Stations</div>
        </div>
      </div>
    </div>
  );
}
