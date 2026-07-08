import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/route-matcher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      routeGeometry: 'w|jyH|{R??',
      fuelType: 'E10',
      bufferMeters: 8046
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data.stations.slice(0, 2), null, 2));
}

test();
