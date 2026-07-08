CREATE OR REPLACE FUNCTION calculate_daily_uk_averages()
RETURNS void AS $$
DECLARE
  p_avg NUMERIC; p_low NUMERIC; p_high NUMERIC;
  d_avg NUMERIC; d_low NUMERIC; d_high NUMERIC;
  p_low_b VARCHAR; p_low_a VARCHAR; p_high_b VARCHAR; p_high_a VARCHAR;
  d_low_b VARCHAR; d_low_a VARCHAR; d_high_b VARCHAR; d_high_a VARCHAR;
  total_stations INTEGER;
BEGIN
  -- We need the most recent price for each station and fuel type
  WITH LatestPrices AS (
    SELECT DISTINCT ON (station_id, fuel_type) 
      p.station_id, p.fuel_type, p.price, s.brand, s.postcode
    FROM prices p
    JOIN stations s ON p.station_id = s.id
    ORDER BY station_id, fuel_type, recorded_at DESC
  )
  SELECT 
    (SELECT FLOOR(AVG(price)) + 0.9 FROM LatestPrices WHERE fuel_type = 'E10' AND price BETWEEN 130 AND 199),
    (SELECT FLOOR(AVG(price)) + 0.9 FROM LatestPrices WHERE fuel_type = 'B7' AND price BETWEEN 135 AND 210),
    (SELECT COUNT(DISTINCT station_id) FROM LatestPrices WHERE fuel_type IN ('E10', 'B7'))
  INTO p_avg, d_avg, total_stations;

  -- Petrol Low
  WITH LatestPrices AS (
    SELECT DISTINCT ON (station_id, fuel_type) 
      p.station_id, p.fuel_type, p.price, s.brand, s.postcode
    FROM prices p JOIN stations s ON p.station_id = s.id
    WHERE p.fuel_type = 'E10' AND p.price BETWEEN 130 AND 199
    ORDER BY station_id, fuel_type, recorded_at DESC
  )
  SELECT price, brand, postcode INTO p_low, p_low_b, p_low_a
  FROM LatestPrices ORDER BY price ASC LIMIT 1;

  -- Petrol High
  WITH LatestPrices AS (
    SELECT DISTINCT ON (station_id, fuel_type) 
      p.station_id, p.fuel_type, p.price, s.brand, s.postcode
    FROM prices p JOIN stations s ON p.station_id = s.id
    WHERE p.fuel_type = 'E10' AND p.price BETWEEN 130 AND 199
    ORDER BY station_id, fuel_type, recorded_at DESC
  )
  SELECT price, brand, postcode INTO p_high, p_high_b, p_high_a
  FROM LatestPrices ORDER BY price DESC LIMIT 1;

  -- Diesel Low
  WITH LatestPrices AS (
    SELECT DISTINCT ON (station_id, fuel_type) 
      p.station_id, p.fuel_type, p.price, s.brand, s.postcode
    FROM prices p JOIN stations s ON p.station_id = s.id
    WHERE p.fuel_type = 'B7' AND p.price BETWEEN 135 AND 210
    ORDER BY station_id, fuel_type, recorded_at DESC
  )
  SELECT price, brand, postcode INTO d_low, d_low_b, d_low_a
  FROM LatestPrices ORDER BY price ASC LIMIT 1;

  -- Diesel High
  WITH LatestPrices AS (
    SELECT DISTINCT ON (station_id, fuel_type) 
      p.station_id, p.fuel_type, p.price, s.brand, s.postcode
    FROM prices p JOIN stations s ON p.station_id = s.id
    WHERE p.fuel_type = 'B7' AND p.price BETWEEN 135 AND 210
    ORDER BY station_id, fuel_type, recorded_at DESC
  )
  SELECT price, brand, postcode INTO d_high, d_high_b, d_high_a
  FROM LatestPrices ORDER BY price DESC LIMIT 1;

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

SELECT calculate_daily_uk_averages();
