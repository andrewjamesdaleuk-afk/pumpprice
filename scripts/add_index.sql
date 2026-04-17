-- Add compound index to speed up the LATERAL JOIN for prices
CREATE INDEX IF NOT EXISTS prices_station_fuel_time_idx ON prices (station_id, fuel_type, recorded_at DESC);
