import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import dotenv from "dotenv";
dotenv.config();

const MAJOR_CITIES = {
  'London': { lat: 51.5074456, lon: -0.1277653 },
  'Birmingham': { lat: 52.4796992, lon: -1.9026911 },
  'Glasgow': { lat: 55.8611550, lon: -4.2501687 },
  'Liverpool': { lat: 53.4071991, lon: -2.9916800 },
  'Bristol': { lat: 51.4538022, lon: -2.5972985 },
  'Manchester': { lat: 53.4794892, lon: -2.2451148 },
  'Sheffield': { lat: 53.3806626, lon: -1.4702278 },
  'Leeds': { lat: 53.7974185, lon: -1.5437941 },
  'Edinburgh': { lat: 55.9533456, lon: -3.1883749 },
  'Leicester': { lat: 52.6362000, lon: -1.1331969 },
  'Coventry': { lat: 52.4081812, lon: -1.5104770 },
  'Bradford': { lat: 53.7944229, lon: -1.7519186 },
  'Cardiff': { lat: 51.4816546, lon: -3.1791934 },
  'Belfast': { lat: 54.5975805, lon: -5.9277097 },
  'Nottingham': { lat: 52.9534193, lon: -1.1496461 },
  'Newcastle': { lat: 54.9738474, lon: -1.6131572 },
  'Southampton': { lat: 50.9025349, lon: -1.4041890 }
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
  if (!response.ok) return [];
  const data = await response.json();
  return data.stations || [];
};

async function run() {
  for (const [city, coords] of Object.entries(MAJOR_CITIES)) {
    const pointPolyline = polyline.encode([[coords.lat, coords.lon], [coords.lat + 0.0001, coords.lon + 0.0001]]);
    const stations = await fetchStationsNearRoute(pointPolyline, 'petrol', 8046.72);
    console.log(`${city}: ${stations.length} stations`);
  }
}
run();
