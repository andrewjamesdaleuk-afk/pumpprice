-- Ultra-optimized function to update precomputed_insights one city at a time
CREATE OR REPLACE FUNCTION update_city_insight_single(city_name_in TEXT, lon_in FLOAT, lat_in FLOAT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    nat_avg_e10 NUMERIC;
    nat_avg_b7 NUMERIC;
    city_geom geography;
BEGIN
    -- Get current national averages
    SELECT petrol_avg INTO nat_avg_e10 FROM uk_price_history ORDER BY date DESC LIMIT 1;
    SELECT diesel_avg INTO nat_avg_b7 FROM uk_price_history ORDER BY date DESC LIMIT 1;
    nat_avg_e10 := COALESCE(nat_avg_e10, 145.0);
    nat_avg_b7 := COALESCE(nat_avg_b7, 155.0);

    city_geom := ST_SetSRID(ST_Point(lon_in, lat_in), 4326)::geography;

    -- Calculate stats for this single city using a very fast spatial index lookup
    -- and store in a temporary table or directly update a master state
    -- Actually, simpler: let's use a table 'city_precomputed_buffer' to hold these
    -- then refresh_city_insights just aggregates that table.
    
    INSERT INTO city_precomputed_buffer (city_name, fuel_type, avg_price, diff, station_count, updated_at)
    SELECT 
        city_name_in,
        p.fuel_type,
        ROUND(AVG(p.price), 1),
        ROUND(AVG(p.price) - (CASE WHEN p.fuel_type = 'E10' THEN nat_avg_e10 ELSE nat_avg_b7 END), 1),
        COUNT(*),
        NOW()
    FROM stations s
    JOIN prices p ON p.station_id = s.id
    WHERE ST_DWithin(s.location, city_geom, 8046.72)
      AND p.recorded_at > NOW() - INTERVAL '48 hours'
    GROUP BY p.fuel_type
    ON CONFLICT (city_name, fuel_type) DO UPDATE SET
        avg_price = EXCLUDED.avg_price,
        diff = EXCLUDED.diff,
        station_count = EXCLUDED.station_count,
        updated_at = EXCLUDED.updated_at;
END;
$$;

-- Create the buffer table
CREATE TABLE IF NOT EXISTS city_precomputed_buffer (
    city_name TEXT,
    fuel_type TEXT,
    avg_price NUMERIC,
    diff NUMERIC,
    station_count INT,
    updated_at TIMESTAMPTZ,
    PRIMARY KEY (city_name, fuel_type)
);

-- Aggregator function
CREATE OR REPLACE FUNCTION refresh_city_insights_from_buffer()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cheapest_e10 JSONB;
    cheapest_b7 JSONB;
    expensive_e10 JSONB;
    expensive_b7 JSONB;
BEGIN
    SELECT jsonb_agg(jsonb_build_object('city', city_name, 'price', avg_price, 'diff', diff) ORDER BY avg_price ASC)
    INTO cheapest_e10 FROM city_precomputed_buffer WHERE fuel_type = 'E10' AND station_count >= 2;

    SELECT jsonb_agg(jsonb_build_object('city', city_name, 'price', avg_price, 'diff', diff) ORDER BY avg_price ASC)
    INTO cheapest_b7 FROM city_precomputed_buffer WHERE fuel_type = 'B7' AND station_count >= 2;

    SELECT jsonb_agg(jsonb_build_object('city', city_name, 'price', avg_price, 'diff', diff) ORDER BY avg_price DESC)
    INTO expensive_e10 FROM city_precomputed_buffer WHERE fuel_type = 'E10' AND station_count >= 2;

    SELECT jsonb_agg(jsonb_build_object('city', city_name, 'price', avg_price, 'diff', diff) ORDER BY avg_price DESC)
    INTO expensive_b7 FROM city_precomputed_buffer WHERE fuel_type = 'B7' AND station_count >= 2;

    INSERT INTO public.precomputed_insights (id, insight_type, fuel_type, data, updated_at)
    VALUES 
        ('cheapest_cities_e10', 'cheapest_cities', 'E10', COALESCE(cheapest_e10, '[]'::jsonb), NOW()),
        ('cheapest_cities_b7', 'cheapest_cities', 'B7', COALESCE(cheapest_b7, '[]'::jsonb), NOW()),
        ('expensive_cities_e10', 'expensive_cities', 'E10', COALESCE(expensive_e10, '[]'::jsonb), NOW()),
        ('expensive_cities_b7', 'expensive_cities', 'B7', COALESCE(expensive_b7, '[]'::jsonb), NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
END;
$$;
