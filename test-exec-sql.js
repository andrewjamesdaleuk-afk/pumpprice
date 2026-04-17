import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

fetch(`${safeUrl}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  },
  body: JSON.stringify({ query: 'SELECT 1' })
}).then(async (res) => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}).catch(console.error);
