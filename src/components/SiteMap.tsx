import React from 'react';
import { MapContainer, Marker, Circle, Tooltip } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { parseCoordinates } from '../lib/utils/coordinates';
import { defaultIcon, mapConfig, mapLayers } from '../lib/utils/map';
import { MapLayerControl } from './map/MapLayerControl';
import { MapUpdater } from './map/MapUpdater';
import 'leaflet/dist/leaflet.css';

interface SiteMapProps {
  coordinates: string; // Format: "50°41'14.388"N 13°58'40.115"E"
  className?: string;
}

export function SiteMap({ coordinates, className = 'h-[40rem]' }: SiteMapProps) {
  try {
    const [lat, lon] = parseCoordinates(coordinates);
    
    const position: [number, number] = [lat, lon];
    
    return (
      <div className={`${className} relative rounded-lg overflow-hidden border border-gray-200`}>
        <MapContainer
          bounds={new LatLngBounds(position, position).pad(0.2)}
          style={{ height: '100%', width: '100%' }}
          {...mapConfig}
        >
          <MapUpdater bounds={new LatLngBounds(position, position).pad(0.2)} />
          <MapLayerControl />
          <Marker position={position} icon={defaultIcon}>
            <Tooltip permanent direction="top" offset={[0, -25]} className="bg-white px-2 py-1 rounded shadow-md">{coordinates}</Tooltip>
          </Marker>
          
          <Circle
            center={position}
            radius={1000}
            interactive={true}
            pathOptions={{ 
              color: 'blue', 
              fillColor: 'blue', 
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '5, 5'
            }}
          >
            <Tooltip permanent direction="center" className="bg-white px-2 py-1 rounded shadow-md">
              <div className="text-center">
                <p className="font-medium">Oblast pokrytí</p>
                <p className="text-sm text-gray-600">Radius 1 km od situ</p>
              </div>
            </Tooltip>
          </Circle>
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.error('Chyba při vykreslování mapy:', error);
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200`}>
        <p className="text-gray-500 text-center px-4">
          {error instanceof Error ? error.message : 'Nepodařilo se zobrazit mapu'}
        </p>
      </div>
    );
  }
}
