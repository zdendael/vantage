import { icon } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';

// Default marker icon configuration
export const defaultIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41]
});

// Map layer configurations
export const mapLayers = {
  openStreetMap: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satelitní',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  topographic: {
    name: 'Topografická',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }
};

export const getPolylineCenter = (point1: [number, number], point2: [number, number]): [number, number] => {
  return [
    point1[0] + (point2[0] - point1[0]) / 2,
    point1[1] + (point2[1] - point1[1]) / 2
  ];
};

// Map configuration
export const mapConfig = {
  maxZoom: 18,
  minZoom: 4,
  boundsOptions: {
    padding: [50, 50],
    maxZoom: 15,
    animate: true
  },
  zoomControl: true,
  preferCanvas: true,
  attributionControl: true
};

export const initializeMap = (map: LeafletMap) => {
  setTimeout(() => {
    try {
      map.invalidateSize();
    } catch (error) {
      console.error('Chyba při inicializaci mapy:', error);
    }
  }, 250);
};
