require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { count } = await supabase.from('prices').select('*', { count: 'exact', head: true });
  console.log("Total prices:", count);
  const { data: somePrices } = await supabase.from('prices').select('*').limit(5);
  console.log("Sample prices:", somePrices);
}
run();
