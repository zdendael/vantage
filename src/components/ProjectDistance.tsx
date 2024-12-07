import React from 'react';
import { parseCoordinates, calculateDistance } from '../lib/utils/coordinates';

interface ProjectDistanceProps {
  siteCoordinates: string;
  projectCoordinates: string;
}

export function ProjectDistance({ siteCoordinates, projectCoordinates }: ProjectDistanceProps) {
  try {
    if (!siteCoordinates || !projectCoordinates) {
      return <span className="text-xs text-gray-500">Vzdálenost není k dispozici</span>;
    }

    const distance = calculateDistance(
      parseCoordinates(siteCoordinates),
      parseCoordinates(projectCoordinates)
    );
    
    return (
      <span className="text-xs text-gray-500">
        Vzdálenost: {distance.toFixed(2).replace('.', ',')} km
      </span>
    );
  } catch (error) {
    return (
      <span className="text-xs text-gray-500">
        Chyba: Neplatné GPS souřadnice
      </span>
    );
  }
}