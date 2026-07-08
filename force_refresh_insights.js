require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Triggering refresh_all_insights RPC directly to clear out precomputed data...");
  const { error } = await supabase.rpc('refresh_all_insights');
  if (error) {
    console.error("Error running rpc:", error);
  } else {
    console.log("Success!");
  }
}
run();
