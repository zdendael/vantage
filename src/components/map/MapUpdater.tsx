import React from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngBounds } from 'leaflet';
import { mapConfig } from '../../lib/utils/map';

interface MapUpdaterProps {
  bounds: LatLngBounds;
}

export function MapUpdater({ bounds }: MapUpdaterProps) {
  const map = useMap();
  
  const updateMap = React.useCallback(() => {
    if (!map) return;
    
    try {
      map.invalidateSize();
      map.fitBounds(bounds, mapConfig.boundsOptions);
    } catch (error) {
      // Ignore map errors when component is unmounting
      if (map._loaded) {
        console.error('Chyba při aktualizaci mapy:', error);
      }
    }
  }, [map, bounds]);

  React.useEffect(() => {
    let timeoutId: number;
    
    if (map && map._loaded) {
      timeoutId = window.setTimeout(updateMap, 100);
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [map, bounds]);

  return null;
}