require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');
const fs = require('fs');

async function run() {
  const sql = fs.readFileSync('drop_old_rpc.sql', 'utf8');
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/exec-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  console.log(await res.json());
}
run();
