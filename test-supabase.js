import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
const safeKey = process.env.VITE_SUPABASE_ANON_KEY;

fetch(`${safeUrl}/rest/v1/rpc/get_brand_leaderboard`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': safeKey,
    'Authorization': `Bearer ${safeKey}`
  },
  body: JSON.stringify({ target_fuel_type: 'E10' })
}).then(async (res) => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}).catch(console.error);
