const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Get all stations
  const { data: allStations, error: err1 } = await supabase
    .from('stations')
    .select('id, brand');
    
  if (err1) { console.error(err1); return; }
  
  // 2. Get stations that HAVE prices today
  let pricesToday = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('prices')
      .select('station_id')
      .gte('recorded_at', '2026-03-31T00:00:00Z')
      .in('fuel_type', ['E10', 'E5', 'B7'])
      .range(from, from + step - 1);
      
    if (error) break;
    if (!data || data.length === 0) break;
    pricesToday = pricesToday.concat(data);
    if (data.length < step) break;
    from += step;
  }
  
  const stationsWithPricesToday = new Set(pricesToday.map(p => p.station_id));
  
  // 3. Find missing and group by brand
  const missingByBrand = {};
  for (const station of allStations) {
    if (!stationsWithPricesToday.has(station.id)) {
      const brand = station.brand || 'Unknown';
      missingByBrand[brand] = (missingByBrand[brand] || 0) + 1;
    }
  }
  
  // Sort and print
  const sortedBrands = Object.entries(missingByBrand).sort((a, b) => b[1] - a[1]);
  console.log("Missing Stations by Brand:");
  for (const [brand, count] of sortedBrands) {
    console.log(`- ${brand}: ${count}`);
  }
}
run();
