require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');

async function run() {
  const sql = `
    WITH current_prices AS (
        SELECT s.id as station_id,
            CASE 
                WHEN UPPER(s.brand) = 'ESSO' THEN 'Esso'
                WHEN UPPER(s.brand) = 'SHELL' THEN 'Shell'
                WHEN UPPER(s.brand) = 'BP' THEN 'BP'
                WHEN UPPER(s.brand) = 'TEXACO' THEN 'Texaco'
                WHEN UPPER(s.brand) = 'JET' THEN 'Jet'
                WHEN UPPER(s.brand) = 'TESCO' THEN 'Tesco'
                WHEN UPPER(s.brand) = 'ASDA' THEN 'Asda'
                WHEN UPPER(s.brand) = 'SAINSBURY''S' THEN 'Sainsbury''s'
                WHEN UPPER(s.brand) = 'MORRISONS' THEN 'Morrisons'
                ELSE INITCAP(s.brand)
            END as brand_name
        FROM stations s
    ),
    latest_fuel AS (
        SELECT DISTINCT ON (station_id) station_id, p.price as item_price 
        FROM prices p
        WHERE fuel_type = 'E10' AND p.recorded_at > NOW() - INTERVAL '30 days' AND p.price > 130 AND p.price < 210
        ORDER BY station_id, p.recorded_at DESC
    )
    SELECT c.brand_name, COUNT(lf.item_price) AS count_fuel
    FROM current_prices c
    JOIN latest_fuel lf ON c.station_id = lf.station_id
    GROUP BY c.brand_name
    HAVING COUNT(lf.item_price) > 20
    ORDER BY count_fuel DESC;
  `;
  
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/exec-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  const data = await res.json();
  console.log(data);
}
run();
