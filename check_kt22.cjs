require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: stations } = await supabase.from('stations').select('*').ilike('postcode', 'KT22 0EF%');
  console.log("Stations at KT22 0EF:", stations);
  
  if (stations && stations.length > 0) {
      const { data: prices } = await supabase.from('prices').select('*').eq('station_id', stations[0].id);
      console.log("Prices for station 0:", prices);
  }
}
run();
