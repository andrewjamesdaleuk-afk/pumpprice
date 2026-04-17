
DROP FUNCTION IF EXISTS get_most_expensive_cities(text);
CREATE OR REPLACE FUNCTION get_most_expensive_cities(target_fuel_type TEXT)
RETURNS TABLE (
    city VARCHAR,
    price NUMERIC,
    diff NUMERIC
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
            ('Leeds', ST_SetSRID(ST_Point(-1.5437941, 53.7974185), 4326)::geography),
            ('Edinburgh', ST_SetSRID(ST_Point(-3.1883749, 55.9533456), 4326)::geography),
            ('Leicester', ST_SetSRID(ST_Point(-1.1331969, 52.6362000), 4326)::geography),
            ('Coventry', ST_SetSRID(ST_Point(-1.5104770, 52.4081812), 4326)::geography),
            ('Bradford', ST_SetSRID(ST_Point(-1.7519186, 53.7944229), 4326)::geography),
            ('Cardiff', ST_SetSRID(ST_Point(-3.1791934, 51.4816546), 4326)::geography),
            ('Belfast', ST_SetSRID(ST_Point(-5.9277097, 54.5975805), 4326)::geography),
            ('Nottingham', ST_SetSRID(ST_Point(-1.1496461, 52.9534193), 4326)::geography),
            ('Newcastle', ST_SetSRID(ST_Point(-1.6131572, 54.9738474), 4326)::geography),
            ('Southampton', ST_SetSRID(ST_Point(-1.4041890, 50.9025349), 4326)::geography)
    ),
    latest_prices AS (
        SELECT s.id, s.location, p.price, p.recorded_at,
               ROW_NUMBER() OVER(PARTITION BY s.id ORDER BY p.recorded_at DESC) as rn
        FROM stations s
        JOIN prices p ON p.station_id = s.id
        WHERE p.fuel_type = target_fuel_type
    ),
    current_prices AS (
        SELECT * FROM latest_prices WHERE rn = 1
    ),
    city_averages AS (
        SELECT 
            c.city_name,
            ROUND(AVG(cp.price), 1)::NUMERIC AS avg_price
        FROM major_cities c
        JOIN current_prices cp ON ST_DWithin(cp.location, c.geom, 8046.72)
        GROUP BY c.city_name
        HAVING AVG(cp.price) > 0
    )
    SELECT 
        ca.city_name::VARCHAR as city,
        ca.avg_price as price,
        ROUND(ca.avg_price - COALESCE((SELECT CASE WHEN target_fuel_type='E10' THEN petrol_avg ELSE diesel_avg END FROM uk_price_history ORDER BY date DESC LIMIT 1), 142.0), 1)::NUMERIC as diff
    FROM city_averages ca
    ORDER BY ca.avg_price DESC
    LIMIT 4;
END;
$$ LANGUAGE plpgsql STABLE;

NOTIFY pgrst, 'reload schema';
