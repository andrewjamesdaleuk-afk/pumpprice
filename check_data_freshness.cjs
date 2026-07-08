const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env'});

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Checking data freshness by brand...");
  
  const { data: latestPrices, error } = await supabase.from('prices')
    .select('station_id, recorded_at, stations!inner(brand)')
    .order('recorded_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    return;
  }
  
  const brandStats = {};
  for (const p of latestPrices) {
      const brand = p.stations.brand;
      if (!brandStats[brand]) brandStats[brand] = p.recorded_at;
  }
  console.log("Latest price timestamps per brand (from top 100 overall):", brandStats);

  const { count: nullCount } = await supabase.from('prices').select('*', { count: 'exact', head: true }).is('recorded_at', null);
  console.log("Prices with NULL recorded_at:", nullCount);
}
run();
