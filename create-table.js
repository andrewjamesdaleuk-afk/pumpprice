import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const query = `
CREATE TABLE IF NOT EXISTS public.precomputed_insights (
    id TEXT PRIMARY KEY,
    insight_type TEXT NOT NULL,
    fuel_type VARCHAR(10) NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

fetch(`${safeUrl}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': serviceRole,
    'Authorization': `Bearer ${serviceRole}`
  },
  body: JSON.stringify({ query })
}).then(async (res) => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}).catch(console.error);
