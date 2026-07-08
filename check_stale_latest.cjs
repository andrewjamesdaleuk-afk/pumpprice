const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: 'frontend/.env'});

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: stations, error } = await supabase.from('stations').select('id, brand');
  
  if (error) { console.error(error); return; }

  // Because JS doesn't easily do DISTINCT ON via PostgREST simple queries, we'll fetch prices using a custom grouping in JS if there aren't too many, or we can just fetch all prices and group in JS.
  // Actually, we can just do a select on prices order by recorded_at desc and map them.
  // Let's just fetch all prices and group by station_id and fuel_type.
  console.log(`Fetching all prices...`);
  
  const { data: allPrices, error: pricesError } = await supabase
    .from('prices')
    .select('station_id, recorded_at')
    .order('recorded_at', { ascending: false });

  if (pricesError) { console.error(pricesError); return; }

  const latestPriceMap = new Map();
  for (const p of allPrices) {
    if (!latestPriceMap.has(p.station_id)) {
      latestPriceMap.set(p.station_id, p.recorded_at);
    }
  }

  let staleCount = 0;
  let totalCount = 0;
  const brandStaleCount = {};
  
  const now = Date.now();

  for (const st of stations) {
    const latestRecAt = latestPriceMap.get(st.id);
    if (latestRecAt) {
      totalCount++;
      const isStale = (now - new Date(latestRecAt).getTime()) / (1000 * 60 * 60) > 24;
      if (isStale) {
        staleCount++;
        brandStaleCount[st.brand] = (brandStaleCount[st.brand] || 0) + 1;
      }
    }
  }

  console.log(`Total active stations with prices: ${totalCount}`);
  console.log(`Stale stations (latest price > 24h old): ${staleCount}`);
  console.log(`Stale by brand:`, brandStaleCount);
}
run();
