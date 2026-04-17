import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import dotenv from "dotenv";
dotenv.config();

const fetchStationsNearRoute = async (routeGeometry, fuelType, bufferMeters = 804.672) => {
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

const fetchCityStats = async (postcode, bufferMeters = 8046.72) => {
  const coords = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcode)}&format=json&countrycodes=gb`, { headers: { 'User-Agent': 'Pumpprice.live/1.0' } }).then(res => res.json());
  if (!coords || coords.length === 0) return null;
  const lat = parseFloat(coords[0].lat); const lon = parseFloat(coords[0].lon); const pointPolyline = polyline.encode([[lat, lon], [lat + 0.0001, lon + 0.0001]]);
  
  const [petrolStations, dieselStations] = await Promise.all([
    fetchStationsNearRoute(pointPolyline, 'petrol', bufferMeters),
    fetchStationsNearRoute(pointPolyline, 'diesel', bufferMeters)
  ]);
  
  const calcStats = (stations) => {
    const prices = stations.map(s => s.price).filter(p => p > 0);
    if (prices.length === 0) return null;
    return {
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(1),
      min: Math.min(...prices).toFixed(1),
      max: Math.max(...prices).toFixed(1),
      count: prices.length
    };
  };

  return {
    petrol: calcStats(petrolStations),
    diesel: calcStats(dieselStations)
  };
};

fetchCityStats("London").then(console.log);
