import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  activeScenario: string | null;
}

const MONTGOMERY_CENTER: [number, number] = [32.3792, -86.3077];

function MapUpdater({ activeScenario }: { activeScenario: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (activeScenario === 'road-closure') {
      map.flyTo([32.38, -86.31], 15);
    } else if (activeScenario === 'new-business') {
      map.flyTo([32.36, -86.28], 14);
    } else if (activeScenario === 'public-event') {
      map.flyTo([32.375, -86.305], 16);
    } else {
      map.flyTo(MONTGOMERY_CENTER, 13);
    }
  }, [activeScenario, map]);

  return null;
}

export default function MapView({ activeScenario }: MapViewProps) {
  return (
    <div className="h-full w-full bg-slate-100 relative z-0">
      <MapContainer
        center={MONTGOMERY_CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater activeScenario={activeScenario} />

        {/* Example markers based on scenario */}
        {activeScenario === 'road-closure' && (
          <Marker position={[32.38, -86.31]}>
            <Popup>
              <strong>Dexter Ave</strong><br />
              Proposed construction zone.
            </Popup>
          </Marker>
        )}

        {activeScenario === 'new-business' && (
          <Marker position={[32.36, -86.28]}>
            <Popup>
              <strong>Vacant Property</strong><br />
              123 Commerce St.
            </Popup>
          </Marker>
        )}

        {activeScenario === 'public-event' && (
          <Marker position={[32.375, -86.305]}>
            <Popup>
              <strong>Riverfront Park</strong><br />
              Proposed event location (5,000 attendees).
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Overlay controls */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white p-3 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Map Layers</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm text-slate-600">
            <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
            <span>Traffic Flow</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-slate-600">
            <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
            <span>Zoning Data</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-slate-600">
            <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span>Demographics</span>
          </label>
        </div>
      </div>
    </div>
  );
}
