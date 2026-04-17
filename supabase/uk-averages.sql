-- Create the history table
CREATE TABLE IF NOT EXISTS uk_price_history (
  date DATE PRIMARY KEY,
  petrol_avg NUMERIC(5, 2),
  petrol_low NUMERIC(5, 2),
  petrol_high NUMERIC(5, 2),
  diesel_avg NUMERIC(5, 2),
  diesel_low NUMERIC(5, 2),
  diesel_high NUMERIC(5, 2),
  sample_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read access (for the frontend to query it)
ALTER TABLE uk_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read uk_price_history" ON uk_price_history FOR SELECT USING (true);

-- The function that calculates today's averages and saves them
CREATE OR REPLACE FUNCTION calculate_daily_uk_averages()
RETURNS void AS $$
DECLARE
  p_avg NUMERIC;
  p_low NUMERIC;
  p_high NUMERIC;
  d_avg NUMERIC;
  d_low NUMERIC;
  d_high NUMERIC;
  total_stations INTEGER;
BEGIN
  -- We only want to calculate based on the latest prices available (e.g. within the last 24 hours to ensure freshness)
  
  -- Calculate Petrol (E10)
  SELECT 
    FLOOR(AVG(price)) + 0.9, MIN(price), MAX(price)
  INTO 
    p_avg, p_low, p_high
  FROM prices
  WHERE fuel_type = 'E10' AND recorded_at > NOW() - INTERVAL '24 hours';

  -- Calculate Diesel (B7)
  SELECT 
    FLOOR(AVG(price)) + 0.9, MIN(price), MAX(price)
  INTO 
    d_avg, d_low, d_high
  FROM prices
  WHERE fuel_type = 'B7' AND recorded_at > NOW() - INTERVAL '24 hours';

  -- Count total stations sampled
  SELECT COUNT(DISTINCT station_id) INTO total_stations
  FROM prices
  WHERE recorded_at > NOW() - INTERVAL '24 hours';

  -- Insert or update the row for today's date
  INSERT INTO uk_price_history (date, petrol_avg, petrol_low, petrol_high, diesel_avg, diesel_low, diesel_high, sample_size)
  VALUES (CURRENT_DATE, p_avg, p_low, p_high, d_avg, d_low, d_high, total_stations)
  ON CONFLICT (date) DO UPDATE SET
    petrol_avg = EXCLUDED.petrol_avg,
    petrol_low = EXCLUDED.petrol_low,
    petrol_high = EXCLUDED.petrol_high,
    diesel_avg = EXCLUDED.diesel_avg,
    diesel_low = EXCLUDED.diesel_low,
    diesel_high = EXCLUDED.diesel_high,
    sample_size = EXCLUDED.sample_size,
    created_at = NOW();
    
END;
$$ LANGUAGE plpgsql;

-- To set up the cron job in Supabase (runs every day at 8:00 AM UTC):
-- select cron.schedule('daily-uk-averages', '0 8 * * *', 'SELECT calculate_daily_uk_averages()');
