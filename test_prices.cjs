const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env'});

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Checking price recorded_at format...");
  const { data, error } = await supabase.from('prices').select('recorded_at').limit(5);
  console.log(data);
}
run();
