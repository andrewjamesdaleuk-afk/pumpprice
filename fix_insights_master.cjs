require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');

async function run() {
  console.log("Triggering refresh_all_insights RPC via edge function to bypass proxy timeouts...");
  
  const sql = `SELECT refresh_all_insights();`;

  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/exec-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  const data = await res.json();
  console.log("Response:", data);
}
run();
