
DROP FUNCTION IF EXISTS get_one_mile_winners(text);
CREATE OR REPLACE FUNCTION get_one_mile_winners(target_fuel_type TEXT)
RETURNS TABLE (
    pair VARCHAR,
    expensive NUMERIC,
    cheap NUMERIC,
    gap NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH major_cities(city_name, geom) AS (
        VALUES 
            ('London', ST_SetSRID(ST_Point(-0.1277653, 51.5074456), 4326)::geography),
            ('Birmingham', ST_SetSRID(ST_Point(-1.9026911, 52.4796992), 4326)::geography),
            ('Glasgow', ST_SetSRID(ST_Point(-4.2501687, 55.8611550), 4326)::geography),
            ('Liverpool', ST_SetSRID(ST_Point(-2.9916800, 53.4071991), 4326)::geography),
            ('Bristol', ST_SetSRID(ST_Point(-2.5972985, 51.4538022), 4326)::geography),
            ('Manchester', ST_SetSRID(ST_Point(-2.2451148, 53.4794892), 4326)::geography),
            ('Sheffield', ST_SetSRID(ST_Point(-1.4702278, 53.3806626), 4326)::geography),
            ('Leeds', ST_SetSRID(ST_Point(-1.5437941, 53.7974185), 4326)::geography)
    ),
    latest_prices AS (
        SELECT s.id, s.location, p.price AS fuel_price, p.recorded_at,
               ROW_NUMBER() OVER(PARTITION BY s.id ORDER BY p.recorded_at DESC) as rn
        FROM stations s
        JOIN prices p ON p.station_id = s.id
        WHERE p.fuel_type = target_fuel_type
    ),
    current_prices AS (
        SELECT * FROM latest_prices WHERE rn = 1
    ),
    city_stats AS (
        SELECT 
            c.city_name,
            MAX(cp.fuel_price) as max_p,
            MIN(cp.fuel_price) as min_p
        FROM major_cities c
        JOIN current_prices cp ON ST_DWithin(cp.location, c.geom, 1609.34) -- 1 mile
        GROUP BY c.city_name
        HAVING MAX(cp.fuel_price) - MIN(cp.fuel_price) > 0
    )
    SELECT 
        city_name::VARCHAR as pair,
        max_p::NUMERIC as expensive,
        min_p::NUMERIC as cheap,
        (max_p - min_p)::NUMERIC as gap
    FROM city_stats
    ORDER BY gap DESC
    LIMIT 4;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_one_mile_winners(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
