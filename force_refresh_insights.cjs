require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');

async function run() {
  console.log("Using REST API direct call to bump timeout...");
  
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/refresh_all_insights`, {
    method: 'POST',
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
      'Prefer': 'statement-timeout=300000' // 5 minutes
    }
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Result:", text.substring(0, 500));
}
run();
