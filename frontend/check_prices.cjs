const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count: totalStations, error: err1 } = await supabase
    .from('stations')
    .select('id', { count: 'exact', head: true });
    
  if (err1) {
    console.error('Error fetching stations:', err1);
    return;
  }
    
  let allPrices = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('prices')
      .select('station_id')
      .gte('recorded_at', '2026-03-31T00:00:00Z')
      .in('fuel_type', ['E10', 'E5', 'B7'])
      .range(from, from + step - 1);
      
    if (error) { 
      console.error('Error fetching prices:', error); 
      break; 
    }
    if (!data || data.length === 0) break;
    allPrices = allPrices.concat(data);
    if (data.length < step) break;
    from += step;
  }
  
  const uniqueStationsWithPrices = new Set(allPrices.map(p => p.station_id));
  const missingStations = totalStations - uniqueStationsWithPrices.size;
  
  console.log('Total stations:', totalStations);
  console.log('Stations with at least one Petrol/Diesel price today:', uniqueStationsWithPrices.size);
  console.log('Stations WITHOUT a Petrol or Diesel price today:', missingStations);
}
run();
