-- 1. Create a function to delete old prices
CREATE OR REPLACE FUNCTION purge_old_prices()
RETURNS void AS $$
BEGIN
  -- Keep prices from the last 7 days only, as historical averages are tracked in uk_price_history
  DELETE FROM prices WHERE recorded_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 2. Run it right now to clear the bloat
SELECT purge_old_prices();

-- 3. Schedule it to run daily at midnight (if pg_cron is available)
-- Note: 'daily-price-purge' is the job name. We use cron.schedule to run it every day at 00:00.
SELECT cron.schedule('daily-price-purge', '0 0 * * *', 'SELECT purge_old_prices()');
