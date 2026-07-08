const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Applying 24-hour aggressive purge logic...");
    const { error: fnError } = await supabase.rpc('exec_sql', {
      query: fs.readFileSync('update_purge.sql', 'utf8')
    });
    
    if (fnError && fnError.code === 'PGRST202') {
       console.log("No exec_sql RPC available. Running manual delete query via REST API...");
       const { error, count } = await supabase
         .from('prices')
         .delete({ count: 'exact' })
         .lt('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
         
       if (error) console.error("Purge Error:", error);
       else console.log(`SUCCESS: Purged ${count} old price records.`);
    }
}
run();
