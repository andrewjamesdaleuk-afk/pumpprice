import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
const safeKey = process.env.VITE_SUPABASE_ANON_KEY;

async function fetchFromRpc(rpcName, params = {}) {
  const res = await fetch(`${safeUrl}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': safeKey,
      'Authorization': `Bearer ${safeKey}`
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
     console.error(`RPC ${rpcName} failed: ${res.status}`);
     return null;
  }
  return await res.json();
}

async function updateTable(id, type, fuel, data) {
  const res = await fetch(`${safeUrl}/rest/v1/precomputed_insights?id=eq.${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': safeKey,
      'Authorization': `Bearer ${safeKey}`,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id,
      insight_type: type,
      fuel_type: fuel,
      data,
      updated_at: new Date().toISOString()
    })
  });
  console.log(`Update ${id} status: ${res.status}`);
}

async function run() {
  console.log('Fetching latest national averages...');
  const histRes = await fetch(`${safeUrl}/rest/v1/uk_price_history?select=*&order=date.desc&limit=1`, {
      headers: { 'apikey': safeKey, 'Authorization': `Bearer ${safeKey}` }
  });
  const hist = await histRes.json();
  const nat_e10 = hist[0]?.petrol_avg || 145.0;
  const nat_b7 = hist[0]?.diesel_avg || 155.0;
  console.log(`National Averages: E10=${nat_e10}, B7=${nat_b7}`);

  // Brand Leaderboards
  console.log('Fetching brand leaderboards...');
  const b_e10 = await fetchFromRpc('get_brand_leaderboard', { target_fuel_type: 'E10' });
  const b_b7 = await fetchFromRpc('get_brand_leaderboard', { target_fuel_type: 'B7' });

  if (b_e10) await updateTable('brand_leaderboard_e10', 'brand_leaderboard', 'E10', b_e10.slice(0, 10));
  if (b_b7) await updateTable('brand_leaderboard_b7', 'brand_leaderboard', 'B7', b_b7.slice(0, 10));

  // Cities
  console.log('Fetching city rankings...');
  const c_e10 = await fetchFromRpc('get_cheapest_cities', { target_fuel_type: 'E10' });
  const c_b7 = await fetchFromRpc('get_cheapest_cities', { target_fuel_type: 'B7' });
  const e_e10 = await fetchFromRpc('get_most_expensive_cities', { target_fuel_type: 'E10' });
  const e_b7 = await fetchFromRpc('get_most_expensive_cities', { target_fuel_type: 'B7' });

  if (c_e10) await updateTable('cheapest_cities_e10', 'cheapest_cities', 'E10', c_e10);
  if (c_b7) await updateTable('cheapest_cities_b7', 'cheapest_cities', 'B7', c_b7);
  if (e_e10) await updateTable('expensive_cities_e10', 'expensive_cities', 'E10', e_e10);
  if (e_b7) await updateTable('expensive_cities_b7', 'expensive_cities', 'B7', e_b7);
  
  console.log('Done.');
}

run().catch(console.error);
