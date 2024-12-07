import { LatLngBounds } from 'leaflet';

const GPS_REGEX = /^(\d{1,2})°(\d{1,2})'(\d{1,2}(?:\.\d{1,3})?)"([NS])\s*,?\s*(\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d{1,3})?)"([EW])$/;

export const normalizeGpsCoordinates = (coords: string): string => {
  if (!coords) return '';

  const normalized = coords
    .trim()
    .replace(/\s*,\s*/g, ' ')  // Replace comma and surrounding spaces with single space
    .replace(/\s+/g, ' ');     // Normalize remaining spaces

  const match = normalized.match(GPS_REGEX);
  if (!match) return normalized;

  // Reconstruct in standard format
  const [, latDeg, latMin, latSec, latDir, lonDeg, lonMin, lonSec, lonDir] = match;
  return `${latDeg}°${latMin}'${latSec}"${latDir} ${lonDeg}°${lonMin}'${lonSec}"${lonDir}`;
};

export const parseCoordinates = (coords: string): [number, number] => {
  if (!coords) {
    throw new Error('Nejsou zadány GPS souřadnice');
  }

  const normalizedCoords = normalizeGpsCoordinates(coords);
  
  // Validate format before parsing
  const match = normalizedCoords.match(GPS_REGEX);
  if (!match) {
    throw new Error('Neplatný formát GPS souřadnic. Použijte formát: 50°41\'14.388"N 13°58\'40.115"E');
  }

  const [, latDeg, latMin, latSec, latDir, lonDeg, lonMin, lonSec, lonDir] = match;
  
  // Validace rozsahů
  const lat = parseInt(latDeg);
  const lon = parseInt(lonDeg);
  const latM = parseInt(latMin);
  const lonM = parseInt(lonMin);
  const latS = parseFloat(latSec);
  const lonS = parseFloat(lonSec);

  if (lat > 90 || lon > 180 ||
      latM >= 60 || lonM >= 60 ||
      latS >= 60 || lonS >= 60) {
    throw new Error('GPS souřadnice jsou mimo platný rozsah');
  }
  
  let latitude = lat + latM/60 + latS/3600;
  let longitude = lon + lonM/60 + lonS/3600;
  
  if (latDir === 'S') latitude = -latitude;
  if (lonDir === 'W') longitude = -longitude;
  
  // Validace výsledných souřadnic
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('GPS souřadnice jsou mimo platný rozsah');
  }
  
  return [latitude, longitude];
};

export const formatGpsCoordinate = (value: number, isLatitude: boolean): string => {
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = Math.floor((abs - deg) * 60);
  const sec = ((abs - deg - min / 60) * 3600).toFixed(3).padStart(6, '0');
  const dir = isLatitude
    ? value >= 0 ? 'N' : 'S'
    : value >= 0 ? 'E' : 'W';

  return `${deg.toString().padStart(isLatitude ? 2 : 3, '0')}°${min.toString().padStart(2, '0')}'${sec}"${dir}`;
};

export const formatGpsCoordinates = (lat: number, lon: number): string => {
  return `${formatGpsCoordinate(lat, true)} ${formatGpsCoordinate(lon, false)}`;
};

export const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = coord1[0] * Math.PI / 180;
  const lat2 = coord2[0] * Math.PI / 180;
  const deltaLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const deltaLon = (coord2[1] - coord1[1]) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

export const createMapBounds = (points: [number, number][]): LatLngBounds => {
  if (points.length === 0) {
    throw new Error('Nejsou k dispozici žádné body pro zobrazení na mapě');
  }
  
  // Create a copy of points to avoid modifying the original array
  const uniquePoints = Array.from(new Set(points.map(p => p.join(',')))).map(p => {
    const [lat, lon] = p.split(',');
    return [parseFloat(lat), parseFloat(lon)] as [number, number];
  });

  const bounds = new LatLngBounds([uniquePoints[0]], [uniquePoints[0]]);
  uniquePoints.forEach(point => bounds.extend(point));
  bounds.pad(0.3); // Add 30% padding for better visibility
  return bounds;
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000).toString().replace('.', ',')} m`;
  }
  return `${distance.toFixed(2).replace('.', ',')} km`;
};

export const validateGpsFormat = (value: string): boolean => {
  if (!value) return true;
  return GPS_REGEX.test(value.trim());
};