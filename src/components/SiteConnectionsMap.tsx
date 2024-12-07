import React from 'react';
import { MapContainer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { icon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { parseCoordinates, calculateDistance, createMapBounds } from '../lib/utils/coordinates';
import { defaultIcon, mapConfig, initializeMap } from '../lib/utils/map';
import { MapLayerControl } from './map/MapLayerControl';
import { MapUpdater } from './map/MapUpdater';
import type { Project } from '../types';
import { Radio } from 'lucide-react';

interface SiteConnectionsMapProps {
  siteCoordinates: string;
  siteId: string;
  projects: Project[];
}

function MapInitializer() {
  const map = useMap();
  React.useEffect(() => {
    initializeMap(map);
  }, [map]);
  return null;
}

export function SiteConnectionsMap({ siteCoordinates, siteId, projects }: SiteConnectionsMapProps) {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = React.useState<string | null>(null);

  try {
    const [siteLat, siteLon] = parseCoordinates(siteCoordinates);
    const sitePosition: [number, number] = [siteLat, siteLon];
    const mapClassName = "h-[40rem]";

    // Filter and parse project coordinates
    const validProjects = projects
      .filter(p => p.gpsCoordinates)
      .map(project => ({
        position: parseCoordinates(project.gpsCoordinates!),
        name: project.name,
        id: project.id,
        status: project.status,
        coordinates: project.gpsCoordinates!
      }));

    if (validProjects.length === 0) {
      return (
        <div className={`${mapClassName} flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200`}>
          <p className="text-gray-500">Nejsou k dispozici žádné projekty s GPS souřadnicemi</p>
        </div>
      );
    }

    // Create bounds based on selected project or all projects
    const bounds = selectedProject
      ? createMapBounds([
          sitePosition,
          ...validProjects
            .filter(p => p.id === selectedProject)
            .map(p => p.position)
        ])
      : createMapBounds([sitePosition, ...validProjects.map(p => p.position)]);

    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Propojené projekty</h3>
          <div className="space-y-2">
            {validProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
                className={`w-full text-left px-4 py-2 rounded-lg border ${
                  project.id === selectedProject
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:bg-gray-50'
                } cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Radio className={`h-4 w-4 flex-shrink-0 ${
                      project.id === selectedProject?.id ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{project.name}</span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projekty/${project.id}`);
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Zobrazit projekt
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${mapClassName} relative rounded-lg overflow-hidden border border-gray-200`}>
          <MapContainer
            bounds={bounds}
            {...mapConfig}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <MapInitializer />
            <MapUpdater bounds={bounds} />
            <MapLayerControl />

            <Marker 
              position={sitePosition} 
              icon={defaultIcon} 
              zIndexOffset={2000}
            > 
              <Tooltip permanent direction="top" offset={[0, -25]} className="bg-white px-2 py-1 rounded shadow-md">
                {siteId}
              </Tooltip>
              <Popup>
                <div className="text-center">
                  <h3 className="font-medium">{siteId}</h3>
                  <p className="text-sm text-gray-600">Hlavní site</p>
                </div>
              </Popup>
            </Marker>

            {validProjects
              .filter(p => !selectedProject || p.id === selectedProject)
              .map(({ position, name, id, coordinates }, index) => (
              <React.Fragment key={index}>
                <Marker 
                  position={position} 
                  icon={defaultIcon}
                  zIndexOffset={1500}
                >
                  <Tooltip permanent direction="top" offset={[0, -25]} className="bg-white px-2 py-1 rounded shadow-md">
                    {name}
                  </Tooltip>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-medium">{name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        GPS: {coordinates}
                      </p>
                      <button
                        onClick={() => navigate(`/projekty/${id}`)}
                        className="px-3 py-1 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                      >
                        Zobrazit projekt
                      </button>
                    </div>
                  </Popup>
                </Marker>
                <Polyline
                  positions={[sitePosition, position]}
                  color="blue"
                  weight={2}
                  opacity={0.6}
                  dashArray="5, 10"
                >
                  <Tooltip permanent direction="center" className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-sm text-gray-600">
                        Vzdálenost: {calculateDistance(sitePosition, position).toFixed(2)} km
                      </p>
                    </div>
                  </Tooltip>
                </Polyline>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Chyba při vykreslování mapy:', error);
    return ( 
      <div className={`${mapClassName} flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200`}>
        <p className="text-gray-500">
          {error instanceof Error 
            ? `Nepodařilo se zobrazit mapu: ${error.message}`
            : 'Nepodařilo se zobrazit mapu. Zkontrolujte prosím formát GPS souřadnic.'}
        </p>
      </div>
    );
  }
}