import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const url = 'https://pvutijbggbbrobjlpwrp.supabase.co/rest/v1/rpc/exec_sql';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
CREATE OR REPLACE FUNCTION calculate_daily_uk_averages()
RETURNS void AS $BODY$
DECLARE
  p_avg NUMERIC; p_low NUMERIC; p_high NUMERIC;
  d_avg NUMERIC; d_low NUMERIC; d_high NUMERIC;
  p_low_b VARCHAR; p_low_a VARCHAR; p_high_b VARCHAR; p_high_a VARCHAR;
  d_low_b VARCHAR; d_low_a VARCHAR; d_high_b VARCHAR; d_high_a VARCHAR;
  total_stations INTEGER;
BEGIN
  SET LOCAL statement_timeout = '60s';

  SELECT FLOOR(AVG(price)) + 0.9 INTO p_avg FROM prices WHERE fuel_type = 'E10' AND price >= 145 AND price <= 199 AND recorded_at > NOW() - INTERVAL '24 hours';
  
  SELECT p.price, s.brand, s.postcode INTO p_low, p_low_b, p_low_a FROM prices p JOIN stations s ON p.station_id = s.id WHERE p.fuel_type = 'E10' AND p.price >= 145 AND p.recorded_at > NOW() - INTERVAL '24 hours' ORDER BY p.price ASC LIMIT 1;
  SELECT p.price, s.brand, s.postcode INTO p_high, p_high_b, p_high_a FROM prices p JOIN stations s ON p.station_id = s.id WHERE p.fuel_type = 'E10' AND p.price <= 199 AND p.recorded_at > NOW() - INTERVAL '24 hours' ORDER BY p.price DESC LIMIT 1;

  SELECT FLOOR(AVG(price)) + 0.9 INTO d_avg FROM prices WHERE fuel_type = 'B7' AND price >= 160 AND price <= 210 AND recorded_at > NOW() - INTERVAL '24 hours';

  SELECT p.price, s.brand, s.postcode INTO d_low, d_low_b, d_low_a FROM prices p JOIN stations s ON p.station_id = s.id WHERE p.fuel_type = 'B7' AND p.price >= 160 AND p.recorded_at > NOW() - INTERVAL '24 hours' ORDER BY p.price ASC LIMIT 1;
  SELECT p.price, s.brand, s.postcode INTO d_high, d_high_b, d_high_a FROM prices p JOIN stations s ON p.station_id = s.id WHERE p.fuel_type = 'B7' AND p.price <= 210 AND p.recorded_at > NOW() - INTERVAL '24 hours' ORDER BY p.price DESC LIMIT 1;

  SELECT COUNT(DISTINCT station_id) INTO total_stations FROM prices WHERE ((fuel_type = 'E10' AND price >= 145) OR (fuel_type = 'B7' AND price >= 160)) AND recorded_at > NOW() - INTERVAL '24 hours';

  INSERT INTO uk_price_history (
    date, petrol_avg, petrol_low, petrol_high, diesel_avg, diesel_low, diesel_high, sample_size,
    petrol_low_brand, petrol_low_address, petrol_high_brand, petrol_high_address,
    diesel_low_brand, diesel_low_address, diesel_high_brand, diesel_high_address
  )
  VALUES (
    CURRENT_DATE, p_avg, p_low, p_high, d_avg, d_low, d_high, total_stations,
    p_low_b, p_low_a, p_high_b, p_high_a,
    d_low_b, d_low_a, d_high_b, d_high_a
  )
  ON CONFLICT (date) DO UPDATE SET
    petrol_avg = EXCLUDED.petrol_avg, petrol_low = EXCLUDED.petrol_low, petrol_high = EXCLUDED.petrol_high,
    diesel_avg = EXCLUDED.diesel_avg, diesel_low = EXCLUDED.diesel_low, diesel_high = EXCLUDED.diesel_high,
    sample_size = EXCLUDED.sample_size,
    petrol_low_brand = EXCLUDED.petrol_low_brand, petrol_low_address = EXCLUDED.petrol_low_address,
    petrol_high_brand = EXCLUDED.petrol_high_brand, petrol_high_address = EXCLUDED.petrol_high_address,
    diesel_low_brand = EXCLUDED.diesel_low_brand, diesel_low_address = EXCLUDED.diesel_low_address,
    diesel_high_brand = EXCLUDED.diesel_high_brand, diesel_high_address = EXCLUDED.diesel_high_address,
    created_at = NOW();
END;
$BODY$ LANGUAGE plpgsql;
`;

fetch(url, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: 'Bearer ' + key }, 
    body: JSON.stringify({ query: sql }) 
})
.then(r => r.text().then(t => console.log('Create function:', r.status, t)))
.then(() => {
    console.log("Triggering calculate_daily_uk_averages()...");
    return fetch('https://pvutijbggbbrobjlpwrp.supabase.co/rest/v1/rpc/calculate_daily_uk_averages', { 
        method: 'POST', 
        headers: { apikey: key, Authorization: 'Bearer ' + key } 
    });
})
.then(r => r.text().then(t => console.log('Calculate Averages:', r.status, t)))
.catch(console.error);
