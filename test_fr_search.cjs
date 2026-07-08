require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_stations_along_route', {
      route_line: 'SRID=4326;POINT(2.3364 48.8625)',
      buffer_meters: 50000,
      target_fuel_type: 'E10'
  });
  
  if (error) console.error("RPC Error:", error);
  console.log("Stations found:", data?.length);
  if (data && data.length > 0) {
      console.log("Sample station:", data[0]);
  }
}
run();
