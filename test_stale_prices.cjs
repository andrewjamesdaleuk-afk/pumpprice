const fetch = require('node-fetch');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const query = `
WITH LatestPrices AS (
  SELECT DISTINCT ON (p.station_id, p.fuel_type) 
    p.station_id, p.fuel_type, p.recorded_at, s.brand, s.site_id
  FROM prices p
  JOIN stations s ON s.id = p.station_id
  ORDER BY p.station_id, p.fuel_type, p.recorded_at DESC
)
SELECT brand, COUNT(*) as stale_count
FROM LatestPrices
WHERE recorded_at < NOW() - INTERVAL '24 hours'
GROUP BY brand
ORDER BY stale_count DESC;
`;

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRole,
      'Authorization': `Bearer ${serviceRole}`
    },
    body: JSON.stringify({ query })
  });
  
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}
run();
