require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Identifying stations with no prices...");
  // We can't do a DELETE with a JOIN easily without an RPC. 
  // Let's use JS to fetch all station IDs and price station_ids, then delete.
  
  let allStations = [];
  let from = 0;
  while(true) {
      const { data } = await supabase.from('stations').select('id, site_id').range(from, from + 999);
      if (!data || data.length === 0) break;
      allStations = allStations.concat(data);
      from += 1000;
  }
  
  console.log(`Fetched ${allStations.length} stations.`);
  
  const { data: priceData } = await supabase.from('prices').select('station_id');
  const stationsWithPrices = new Set(priceData.map(p => p.station_id));
  
  const orphanedIds = allStations.filter(s => !stationsWithPrices.has(s.id)).map(s => s.id);
  
  console.log(`Found ${orphanedIds.length} orphaned stations to delete.`);
  
  // Delete in batches of 100
  let deletedCount = 0;
  for (let i = 0; i < orphanedIds.length; i += 100) {
      const batch = orphanedIds.slice(i, i + 100);
      const { error } = await supabase.from('stations').delete().in('id', batch);
      if (error) {
          console.error("Error deleting batch:", error);
      } else {
          deletedCount += batch.length;
          process.stdout.write(`\rDeleted ${deletedCount} / ${orphanedIds.length}`);
      }
  }
  console.log("\nDone deleting orphaned stations.");
  
  console.log("Triggering refresh_all_insights RPC...");
  const fetch = require('node-fetch');
  await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/refresh_all_insights`, {
        method: 'POST',
        headers: {
            'apikey': process.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
            'Prefer': 'statement-timeout=300000'
        }
  });
  console.log("Done.");
}
run();
