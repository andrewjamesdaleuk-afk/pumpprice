import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import dotenv from "dotenv";
dotenv.config();

const coords = { lat: 52.6362000, lon: -1.1331969 }; // Leicester
const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
const safeKey = process.env.VITE_SUPABASE_ANON_KEY;

const fetchStationsNearRoute = async (routeGeometry, fuelType, bufferMeters = 8046.72) => {
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
  if (!response.ok) {
    console.error('Fetch failed:', response.status, await response.text());
    return [];
  }
  const data = await response.json();
  return data.stations || [];
};

async function run() {
  const pointPolyline = polyline.encode([[coords.lat, coords.lon], [coords.lat + 0.0001, coords.lon + 0.0001]]);
  const stations = await fetchStationsNearRoute(pointPolyline, 'diesel', 16093.4); // 10 miles radius
  
  if (stations.length === 0) {
    console.log('No stations found.');
    return;
  }
  
  // Filter out null prices
  const validStations = stations.filter(s => s.price !== null && s.price !== undefined);
  
  if (validStations.length === 0) {
    console.log('No stations with valid prices found.');
    // Print all stations to see what we're getting
    console.log('All stations returned (first 3):', stations.slice(0, 3));
    return;
  }
  
  // Sort by price (cheapest first)
  validStations.sort((a, b) => a.price - b.price);
  
  const cheapest = validStations[0];
  console.log(`Cheapest Diesel in Leicester area (10-mile radius):`);
  console.log(`Brand: ${cheapest.brand}`);
  console.log(`Price: ${cheapest.price}p`);
  console.log(`Postcode: ${cheapest.postcode}`);
  console.log(`Distance from city center: ${(cheapest.distance_from_route / 1609.34).toFixed(2)} miles`);
  
  console.log('\nTop 3 cheapest:');
  validStations.slice(0, 3).forEach((s, i) => {
    console.log(`${i+1}. ${s.brand} (${s.postcode}) - ${s.price}p`);
  });
}
run();
