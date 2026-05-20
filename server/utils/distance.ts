import axios from "axios";

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 *
 * @returns Distance in kilometers
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Geocodes a natural language location string to coordinates using OpenStreetMap Nominatim.
 * Nominatim is a free geocoding API, but requires a User-Agent header.
 */
export async function geocodeLocation(locationText: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedLocation = encodeURIComponent(`${locationText}, Islamabad, Pakistan`);
    
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`, {
      headers: {
        "User-Agent": "KhidmatAI/1.0 (hackathon-prototype)",
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }
    
    return null;
  } catch (error) {
    console.error("[Geocode Error]:", error);
    return null;
  }
}
