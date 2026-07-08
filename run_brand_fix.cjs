require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');
const fs = require('fs');

async function run() {
  const sql = fs.readFileSync('fix_brand_leaderboard.sql', 'utf8');
  console.log("Applying RPC fix for brand leaderboard...");
  
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
