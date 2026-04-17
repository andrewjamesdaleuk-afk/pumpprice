import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import dotenv from "dotenv";
dotenv.config();

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

async function run() {
  const pointPolyline = polyline.encode([[54.5975805, -5.9277097], [54.5976805, -5.9276097]]); // Belfast
  const stations = await fetchStationsNearRoute(pointPolyline, 'petrol');
  console.log("Belfast stations sample:", stations[0]);
}
run();
