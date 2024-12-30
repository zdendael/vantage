interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

import { formatGpsCoordinates, parseCoordinates } from './coordinates';

export const searchAddress = async (query: string): Promise<Array<{
  address: string;
  coordinates: string;
}>> => {
  try {
    if (!query || query.trim().length < 3) return [];

    const encodedQuery = encodeURIComponent(query.trim() + ', Česká republika');
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&countrycodes=cz&limit=5&accept-language=cs`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VantageTowersWIA/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data: NominatimResult[] = await response.json();

    return data.map(result => ({
      address: result.display_name.split(', Česk')[0],
      coordinates: formatGpsCoordinates(parseFloat(result.lat), parseFloat(result.lon))
    }));

  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return [];
  }
};
