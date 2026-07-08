require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { count } = await supabase.from('prices')
    .select('*', { count: 'exact', head: true })
    .gt('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  console.log("Prices updated in the last 24 hours:", count);
  
  const { count: count7Days } = await supabase.from('prices')
    .select('*', { count: 'exact', head: true })
    .gt('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  console.log("Prices updated in the last 7 days:", count7Days);

  const { count: countTotal } = await supabase.from('prices')
    .select('*', { count: 'exact', head: true });
  console.log("Total prices:", countTotal);
}
run();
