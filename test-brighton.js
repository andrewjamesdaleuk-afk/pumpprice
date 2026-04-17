import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import dotenv from "dotenv";
dotenv.config();

const MAJOR_CITIES = {
  'Brighton': { lat: 50.8225, lon: -0.1372 },
  'Oxford': { lat: 51.7520, lon: -1.2577 },
  'Cambridge': { lat: 52.2053, lon: 0.1218 }
};

const fetchStationsNearRoute = async (routeGeometry, fuelType, bufferMeters = 8046.72) => {
  const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
  const safeKey = process.env.VITE_SUPABASE_ANON_KEY;
  const fuelTypeParam = fuelType === 'petrol' ? 'E10' : 'B7';
  
  const response = await fetch(`${safeUrl}/functions/v1/route-matcher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${safeKey}`,
    },
    body: JSON.stringify({
      routeGeometry,
      fuelType: fuelTypeParam,
      bufferMeters
    })
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.stations || [];
};

export const fetchCityStats = async (postcodeOrCity, bufferMeters = 8046.72) => {
  try {
    const lat = MAJOR_CITIES[postcodeOrCity].lat;
    const lon = MAJOR_CITIES[postcodeOrCity].lon;
    const pointPolyline = polyline.encode([[lat, lon], [lat + 0.0001, lon + 0.0001]]);
    
    const [petrolStations, dieselStations] = await Promise.all([
      fetchStationsNearRoute(pointPolyline, 'petrol', bufferMeters),
      fetchStationsNearRoute(pointPolyline, 'diesel', bufferMeters)
    ]);
    
    return {
      petrol: petrolStations?.length,
      diesel: dieselStations?.length
    };
  } catch (error) {
    return null;
  }
};

async function run() {
  const cities = ['Brighton', 'Oxford', 'Cambridge'];
  const fullStats = await Promise.all(
    cities.map(async (city) => {
      const stats = await fetchCityStats(city);
      console.log(city, stats);
      return stats;
    })
  );
}
run();
