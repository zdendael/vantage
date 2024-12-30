import React from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';
import { mapLayers } from '../../lib/utils/map';

export function MapLayerControl() {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name={mapLayers.openStreetMap.name}>
        <TileLayer
          attribution={mapLayers.openStreetMap.attribution}
          url={mapLayers.openStreetMap.url}
        />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer name={mapLayers.satellite.name}>
        <TileLayer
          attribution={mapLayers.satellite.attribution}
          url={mapLayers.satellite.url}
        />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer name={mapLayers.topographic.name}>
        <TileLayer
          attribution={mapLayers.topographic.attribution}
          url={mapLayers.topographic.url}
        />
      </LayersControl.BaseLayer>
    </LayersControl>
  );
}
