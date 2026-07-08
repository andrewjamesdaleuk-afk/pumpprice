require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('precomputed_insights').select('id, data').limit(10);
  for (const row of data) {
    console.log(`\nInsight: ${row.id}`);
    console.log(JSON.stringify(row.data).substring(0, 150) + "...");
  }
}
run();
