import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const fetchAllCityStats = async () => {
  const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
  const safeKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  const response = await fetch(`${safeUrl}/rest/v1/rpc/get_all_city_stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': safeKey,
      'Authorization': `Bearer ${safeKey}`
    }
  });
  const data = await response.json();
  return data || [];
};

fetchAllCityStats().then(console.log).catch(console.error);
