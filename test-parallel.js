import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import dotenv from "dotenv";
dotenv.config();

const MAJOR_CITIES = {
  'London': { lat: 51.5074456, lon: -0.1277653 },
  'Birmingham': { lat: 52.4796992, lon: -1.9026911 },
  'Glasgow': { lat: 55.8611550, lon: -4.2501687 },
  'Liverpool': { lat: 53.4071991, lon: -2.9916800 },
  'Bristol': { lat: 51.4538022, lon: -2.5972985 }
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
  const cities = ['London', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol'];
  const fullStats = await Promise.all(
    cities.map(async (city) => {
      const stats = await fetchCityStats(city);
      console.log(city, stats);
      return stats;
    })
  );
}
run();
