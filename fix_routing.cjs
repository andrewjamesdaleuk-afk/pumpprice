require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');
const fs = require('fs');

async function run() {
  const sql = fs.readFileSync('fix_routing_rpc.sql', 'utf8');
  console.log("Applying RPC fix...");
  
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Result:", text.substring(0, 500));
}
run();
