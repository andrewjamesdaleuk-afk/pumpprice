import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
const safeKey = process.env.VITE_SUPABASE_ANON_KEY;

fetch(`${safeUrl}/rest/v1/uk_price_history?select=*&order=date.desc&limit=5`, {
  headers: {
    'apikey': safeKey,
    'Authorization': `Bearer ${safeKey}`
  }
}).then(async (res) => {
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', JSON.stringify(data, null, 2));
}).catch(console.error);
