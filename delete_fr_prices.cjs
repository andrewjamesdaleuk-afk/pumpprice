require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.log("Deleting old FR prices for re-mapping...");
  // Use a join to delete only prices for French stations
  // Actually, we can just filter by fuel_type IN ('Gazole', 'SP95', 'SP98')
  const { error } = await supabase.from('prices').delete().in('fuel_type', ['Gazole', 'SP95', 'SP98']);
  console.log("Done:", error || "Success");
}
run();
