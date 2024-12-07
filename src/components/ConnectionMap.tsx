import React from 'react';
import { MapContainer, Marker, Polyline, Circle, Tooltip, Popup } from 'react-leaflet';
import { parseCoordinates, calculateDistance, createMapBounds } from '../lib/utils/coordinates';
import { defaultIcon, mapConfig, getPolylineCenter } from '../lib/utils/map';
import { MapLayerControl } from './map/MapLayerControl';
import { MapUpdater } from './map/MapUpdater';
import 'leaflet/dist/leaflet.css';

interface ConnectionMapProps {
  point1: string; // GPS coordinates of first point
  point2: string; // GPS coordinates of second point
  label1?: string; // Optional label for first point
  label2?: string; // Optional label for second point
  microwaveBand?: string; // Optional microwave band
  className?: string;
}

export function ConnectionMap({ point1, point2, label1, label2, microwaveBand, className = "h-[40rem]" }: ConnectionMapProps) {
  try {
    const [lat1, lon1] = parseCoordinates(point1);
    const [lat2, lon2] = parseCoordinates(point2);
    
    const position1: [number, number] = [lat1, lon1];
    const position2: [number, number] = [lat2, lon2];
    const bounds = createMapBounds([position1, position2]);
    const distance = calculateDistance(position1, position2);

    const containerClassName = `${className} relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50`;

    return (
      <div className={containerClassName}>
        <MapContainer
          {...mapConfig}
          bounds={bounds}
          style={{ height: '100%', width: '100%' }}
        >
          <MapUpdater bounds={bounds} />
          <MapLayerControl />
          
          <Marker position={position1} icon={defaultIcon} zIndexOffset={1000}>
            <Tooltip permanent direction="top" offset={[0, -25]} className="bg-white px-2 py-1 rounded shadow-md">
              {label1 || 'Bod 1'}
              <br />
              {point1}
            </Tooltip>
          </Marker>
          <Marker position={position2} icon={defaultIcon}>
            <Tooltip permanent direction="top" offset={[0, -25]} className="bg-white px-2 py-1 rounded shadow-md">
              {label2 || 'Bod 2'}
              <br />
              {point2}
            </Tooltip>
          </Marker>
          <Circle
            center={position1}
            radius={500}
            pathOptions={{ 
              color: 'blue', 
              fillColor: 'blue', 
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '5, 5'
            }}
          />
          <Circle
            center={position2}
            radius={500}
            pathOptions={{ 
              color: 'blue', 
              fillColor: 'blue', 
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '5, 5'
            }}
          />
          <Polyline 
            positions={[position1, position2]} 
            color="blue" 
            weight={2}
            opacity={0.7}
            dashArray="5, 10"
            className="connection-line z-[450]"
          >
            <Tooltip
              position={getPolylineCenter(position1, position2)}
              direction="center"
              permanent
              interactive={false}
              className="connection-distance"
              key={`${point1}-${point2}-${microwaveBand}`}
            >
              <div className="text-center whitespace-nowrap">
                <p className="font-medium text-gray-700 flex items-center space-x-2">
                  <span>{distance.toFixed(2).replace('.', ',')} km</span>
                  <span className={`text-sm font-medium ${
                    microwaveBand 
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-500 bg-gray-100'
                  } px-2 py-0.5 rounded-full`}>
                    {microwaveBand || 'Pásmo neurčeno'}
                  </span>
                </p>
              </div>
            </Tooltip>
          </Polyline>
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.error('Chyba při vykreslování mapy:', error);
    const errorClassName = `${className} flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200`;
    
    return (
      <div className={errorClassName}>
        <p className="text-gray-500 text-center px-4">
          {error instanceof Error ? error.message : 'Nepodařilo se zobrazit mapu'}
        </p>
      </div>
    );
  }
}