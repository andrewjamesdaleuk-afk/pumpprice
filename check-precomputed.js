import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
const safeKey = process.env.VITE_SUPABASE_ANON_KEY;

async function check() {
  const res = await fetch(`${safeUrl}/rest/v1/precomputed_insights?select=*`, {
    headers: {
      'apikey': safeKey,
      'Authorization': `Bearer ${safeKey}`
    }
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Table Rows:', data.length);
  console.log('Data:', JSON.stringify(data, null, 2));
}
check();
