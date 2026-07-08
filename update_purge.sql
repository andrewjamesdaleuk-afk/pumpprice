CREATE OR REPLACE FUNCTION purge_old_prices()
RETURNS void AS $$
BEGIN
  -- Strict 24-hour purge rule. We only keep live data in the prices table.
  -- uk_price_history is completely untouched.
  DELETE FROM prices WHERE recorded_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

SELECT purge_old_prices();
