-- Update the function to fetch the station brand and postcode, and filter out extreme anomalies with tighter thresholds
CREATE OR REPLACE FUNCTION calculate_daily_uk_averages()
RETURNS void AS $$
DECLARE
  p_avg NUMERIC; p_low NUMERIC; p_high NUMERIC;
  d_avg NUMERIC; d_low NUMERIC; d_high NUMERIC;
  p_low_b VARCHAR; p_low_a VARCHAR; p_high_b VARCHAR; p_high_a VARCHAR;
  d_low_b VARCHAR; d_low_a VARCHAR; d_high_b VARCHAR; d_high_a VARCHAR;
  total_stations INTEGER;
BEGIN
  -- Petrol (E10) Average (Filtering out anything below 145p as anomalous data/Costco/Military)
  SELECT FLOOR(AVG(price)) + 0.9 INTO p_avg FROM prices WHERE fuel_type = 'E10' AND price >= 145 AND price <= 199 AND recorded_at > NOW() - INTERVAL '24 hours';
  
  -- Petrol Low Details
  SELECT p.price, s.brand, s.postcode INTO p_low, p_low_b, p_low_a
  FROM prices p JOIN stations s ON p.station_id = s.id
  WHERE p.fuel_type = 'E10' AND p.price >= 145 AND p.recorded_at > NOW() - INTERVAL '24 hours'
  ORDER BY p.price ASC LIMIT 1;

  -- Petrol High Details
  SELECT p.price, s.brand, s.postcode INTO p_high, p_high_b, p_high_a
  FROM prices p JOIN stations s ON p.station_id = s.id
  WHERE p.fuel_type = 'E10' AND p.price <= 199 AND p.recorded_at > NOW() - INTERVAL '24 hours'
  ORDER BY p.price DESC LIMIT 1;

  -- Diesel (B7) Average (Filtering out anything below 160p)
  SELECT FLOOR(AVG(price)) + 0.9 INTO d_avg FROM prices WHERE fuel_type = 'B7' AND price >= 160 AND price <= 210 AND recorded_at > NOW() - INTERVAL '24 hours';

  -- Diesel Low Details
  SELECT p.price, s.brand, s.postcode INTO d_low, d_low_b, d_low_a
  FROM prices p JOIN stations s ON p.station_id = s.id
  WHERE p.fuel_type = 'B7' AND p.price >= 160 AND p.recorded_at > NOW() - INTERVAL '24 hours'
  ORDER BY p.price ASC LIMIT 1;

  -- Diesel High Details
  SELECT p.price, s.brand, s.postcode INTO d_high, d_high_b, d_high_a
  FROM prices p JOIN stations s ON p.station_id = s.id
  WHERE p.fuel_type = 'B7' AND p.price <= 210 AND p.recorded_at > NOW() - INTERVAL '24 hours'
  ORDER BY p.price DESC LIMIT 1;

  -- Count total stations sampled
  SELECT COUNT(DISTINCT station_id) INTO total_stations
  FROM prices WHERE ((fuel_type = 'E10' AND price >= 145) OR (fuel_type = 'B7' AND price >= 160)) AND recorded_at > NOW() - INTERVAL '24 hours';

  -- Insert or update the row for today's date
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
$$ LANGUAGE plpgsql;

-- Recalculate today's data with the new tighter thresholds
SELECT calculate_daily_uk_averages();
