require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: stations } = await supabase.from('stations').select('*').ilike('postcode', 'KT22 0EF%');
  console.log("Stations at KT22 0EF:", stations);
  
  if (stations && stations.length > 0) {
      for (const st of stations) {
          const { data: prices } = await supabase.from('prices').select('*').eq('station_id', st.id);
          console.log(`Prices for station ${st.site_id}:`, prices);
      }
  }
}
run();
