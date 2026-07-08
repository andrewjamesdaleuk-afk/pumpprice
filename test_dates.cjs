const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: 'frontend/.env'});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: latest, error: err1 } = await supabase
    .from('prices')
    .select('recorded_at, station_id, fuel_type')
    .order('recorded_at', { ascending: false })
    .limit(5);
  
  const { data: oldest, error: err2 } = await supabase
    .from('prices')
    .select('recorded_at, station_id, fuel_type')
    .order('recorded_at', { ascending: true })
    .limit(5);

  const { count: staleCount } = await supabase
    .from('prices')
    .select('*', { count: 'exact', head: true })
    .lt('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  console.log("Latest:", latest);
  console.log("Oldest:", oldest);
  console.log("Stale Count (>24h):", staleCount);
}
run();
