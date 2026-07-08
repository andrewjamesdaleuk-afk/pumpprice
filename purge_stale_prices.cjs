require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');

async function run() {
  console.log("Purging strictly old prices that were not updated by the new harvester...");
  
  const query = `
    DELETE FROM prices 
    WHERE recorded_at < NOW() - INTERVAL '24 hours';
  `;

  // We need to execute arbitrary SQL. Since we don't have exec_sql, we might need to use the JS client or REST API to delete.
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  console.log("Deleting prices older than:", twentyFourHoursAgo);
  
  const { data, error } = await supabase
    .from('prices')
    .delete()
    .lt('recorded_at', twentyFourHoursAgo);
    
  if (error) {
    console.error("Error deleting:", error);
  } else {
    console.log("Successfully purged old prices.");
    
    // Rerun insights refresh
    console.log("Refreshing insights...");
    await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/refresh_all_insights`, {
        method: 'POST',
        headers: {
            'apikey': process.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
            'Prefer': 'statement-timeout=300000' // 5 minutes
        }
    });
    console.log("Done.");
  }
}
run();
