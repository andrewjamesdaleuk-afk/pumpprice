const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: 'frontend/.env'});

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      WITH LatestPrices AS (
        SELECT DISTINCT ON (station_id, fuel_type) 
          station_id, fuel_type, recorded_at
        FROM prices
        ORDER BY station_id, fuel_type, recorded_at DESC
      )
      SELECT 
        COUNT(*) as total_stale_stations
      FROM LatestPrices
      WHERE recorded_at < NOW() - INTERVAL '24 hours';
    `
  });
  console.log("Stale stations error?", error);
  console.log("Stale stations data:", data);
  
  const { data: brandBreakdown } = await supabase.rpc('exec_sql', {
    query: `
      WITH LatestPrices AS (
        SELECT DISTINCT ON (p.station_id, p.fuel_type) 
          p.station_id, p.fuel_type, p.recorded_at, s.brand
        FROM prices p
        JOIN stations s ON s.id = p.station_id
        ORDER BY p.station_id, p.fuel_type, p.recorded_at DESC
      )
      SELECT brand, COUNT(*) as stale_count
      FROM LatestPrices
      WHERE recorded_at < NOW() - INTERVAL '24 hours'
      GROUP BY brand
      ORDER BY stale_count DESC;
    `
  });
  console.log("Brand breakdown:", brandBreakdown);
}
run();
