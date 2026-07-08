require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');

async function run() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/exec-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'precomputed_insights'" })
  });
  console.log(await res.json());
}
run();
