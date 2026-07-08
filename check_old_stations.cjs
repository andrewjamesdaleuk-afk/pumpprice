require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { count: totalStations } = await supabase.from('stations').select('*', { count: 'exact', head: true });
  
  // New node_ids are 64 characters long hex strings. Old ones were e.g., 'gcpgbm56fskg'
  const { count: oldStations } = await supabase.from('stations').select('*', { count: 'exact', head: true }).lt('length(site_id)', 60);

  // Wait, PostgREST syntax for length? We can just do a select and filter in JS if not too big, or use the REST API.
  // Actually let's just do a manual query via the JS loop.
  
  const { data: stations } = await supabase.from('stations').select('id, site_id');
  let oldFormatCount = 0;
  let newFormatCount = 0;
  
  for(const s of stations) {
      if (s.site_id.length === 64) newFormatCount++;
      else oldFormatCount++;
  }
  
  console.log("Total stations:", totalStations);
  console.log("Old format stations:", oldFormatCount);
  console.log("New format stations:", newFormatCount);
}
run();
