import { GeoLocation } from '../types';

/**
 * Calculates the Haversine distance in kilometers between two geo coordinates
 */
export function calculateHaversineDistance(
  loc1: GeoLocation,
  loc2: GeoLocation
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  
  const lat1 = toRad(loc1.lat);
  const lat2 = toRad(loc2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates velocity in kilometers per hour given a distance in km and time gap in seconds
 */
export function calculateGeoVelocity(
  distanceKm: number,
  timeDeltaSeconds: number
): number {
  if (timeDeltaSeconds <= 0) return distanceKm > 10 ? 999999 : 0;
  const hours = timeDeltaSeconds / 3600;
  return distanceKm / hours;
}

export const CITIES_DATABASE: Record<string, GeoLocation> = {
  'New York, USA': { country: 'USA', city: 'New York', lat: 40.7128, lng: -74.006 },
  'San Francisco, USA': { country: 'USA', city: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  'Chicago, USA': { country: 'USA', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
  'London, UK': { country: 'UK', city: 'London', lat: 51.5074, lng: -0.1278 },
  'Frankfurt, Germany': { country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  'Tokyo, Japan': { country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  'Singapore': { country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
  'Sydney, Australia': { country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
  'São Paulo, Brazil': { country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  'Mumbai, India': { country: 'India', city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  'Moscow, Russia': { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
  'Bucharest, Romania': { country: 'Romania', city: 'Bucharest', lat: 44.4323, lng: 26.1063 },
};
