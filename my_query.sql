
CREATE OR REPLACE FUNCTION get_motorway_averages(target_fuel_type TEXT)
RETURNS TABLE (
    motorway VARCHAR,
    services VARCHAR,
    price NUMERIC,
    penalty NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_prices AS (
        SELECT s.postcode, p.price AS fuel_price, p.recorded_at,
               ROW_NUMBER() OVER(PARTITION BY s.id ORDER BY p.recorded_at DESC) as rn
        FROM stations s
        JOIN prices p ON p.station_id = s.id
        WHERE p.fuel_type = target_fuel_type
        AND s.is_motorway = TRUE
    ),
    current_prices AS (
        SELECT postcode, fuel_price FROM latest_prices WHERE rn = 1
    )
    SELECT
        REPLACE(m.motorway::VARCHAR, ':', '')::VARCHAR AS motorway,
        m.name::VARCHAR AS services,
        ROUND(AVG(cp.fuel_price), 1)::NUMERIC AS price,
        ROUND(AVG(cp.fuel_price) - COALESCE((SELECT CASE WHEN target_fuel_type='E10' THEN petrol_avg ELSE diesel_avg END FROM uk_price_history ORDER BY date DESC LIMIT 1), 142.0), 1)::NUMERIC AS penalty
    FROM motorway_services m
    JOIN current_prices cp ON cp.postcode ILIKE SUBSTRING(m.postcode FROM 1 FOR LENGTH(m.postcode)-2) || '%'
    GROUP BY m.motorway, m.name
    HAVING AVG(cp.fuel_price) > 0
    ORDER BY AVG(cp.fuel_price) DESC
    LIMIT 4;
END;
$$ LANGUAGE plpgsql STABLE;
NOTIFY pgrst, 'reload schema';
