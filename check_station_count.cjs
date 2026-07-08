require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { count } = await supabase.from('stations').select('*', { count: 'exact', head: true });
  console.log("Total stations remaining:", count);
}
run();
