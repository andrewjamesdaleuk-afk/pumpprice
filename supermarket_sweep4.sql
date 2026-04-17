
DROP FUNCTION IF EXISTS get_supermarket_sweep(text);
CREATE OR REPLACE FUNCTION get_supermarket_sweep(target_fuel_type TEXT)
RETURNS TABLE (
    region VARCHAR,
    petrolAvg NUMERIC,
    dieselAvg NUMERIC,
    nationalPetrol NUMERIC,
    nationalDiesel NUMERIC
) AS $$
DECLARE
    nat_p NUMERIC;
    nat_d NUMERIC;
BEGIN
    SELECT petrol_avg, diesel_avg INTO nat_p, nat_d 
    FROM uk_price_history ORDER BY date DESC LIMIT 1;

    RETURN QUERY
    WITH major_cities(city_name, geom) AS (
        VALUES 
            ('Scotland', ST_SetSRID(ST_Point(-4.2501687, 55.8611550), 4326)::geography),
            ('North East', ST_SetSRID(ST_Point(-1.6131572, 54.9738474), 4326)::geography),
            ('North West', ST_SetSRID(ST_Point(-2.2451148, 53.4794892), 4326)::geography),
            ('Midlands', ST_SetSRID(ST_Point(-1.9026911, 52.4796992), 4326)::geography),
            ('South West', ST_SetSRID(ST_Point(-2.5972985, 51.4538022), 4326)::geography),
            ('South East', ST_SetSRID(ST_Point(-0.1277653, 51.5074456), 4326)::geography)
    ),
    regional_stations AS (
        SELECT s.id, c.city_name
        FROM stations s
        CROSS JOIN major_cities c
        WHERE UPPER(s.brand) IN ('TESCO', 'ASDA', 'SAINSBURY''S', 'MORRISONS', 'APPLEGREEEN')
        AND ST_DWithin(s.location, c.geom, 50000) -- ~30 miles radius
    ),
    latest_prices AS (
        SELECT s.id, p.price, p.fuel_type, p.recorded_at, s.city_name,
               ROW_NUMBER() OVER(PARTITION BY s.id, p.fuel_type ORDER BY p.recorded_at DESC) as rn
        FROM regional_stations s
        JOIN prices p ON p.station_id = s.id
    ),
    current_prices AS (
        SELECT * FROM latest_prices WHERE rn = 1
    ),
    region_averages AS (
        SELECT 
            cp.city_name,
            ROUND(AVG(CASE WHEN cp.fuel_type = 'E10' THEN cp.price END), 1)::NUMERIC AS p_avg,
            ROUND(AVG(CASE WHEN cp.fuel_type = 'B7' THEN cp.price END), 1)::NUMERIC AS d_avg
        FROM current_prices cp
        GROUP BY cp.city_name
    )
    SELECT 
        city_name::VARCHAR as region,
        COALESCE(p_avg, nat_p) as petrolAvg,
        COALESCE(d_avg, nat_d) as dieselAvg,
        ROUND(nat_p, 1)::NUMERIC as nationalPetrol,
        ROUND(nat_d, 1)::NUMERIC as nationalDiesel
    FROM region_averages;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_supermarket_sweep(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
