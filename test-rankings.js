import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import dotenv from "dotenv";
dotenv.config();

const fetchRankedCities = async (type, fuelType = 'E10') => {
  const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
  const safeKey = process.env.VITE_SUPABASE_ANON_KEY;
  const rpcName = type === 'cheapest' ? 'get_cheapest_cities' : 'get_most_expensive_cities';
  const response = await fetch(`${safeUrl}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': safeKey,
      'Authorization': `Bearer ${safeKey}`
    },
    body: JSON.stringify({ target_fuel_type: fuelType })
  });
  const data = await response.json();
  return data || [];
};

async function run() {
  const exp = await fetchRankedCities('expensive');
  console.log('Expensive:', exp);
  const cheap = await fetchRankedCities('cheapest');
  console.log('Cheapest:', cheap);
}
run();
