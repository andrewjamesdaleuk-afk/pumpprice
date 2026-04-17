
DROP FUNCTION IF EXISTS get_motorway_penalty(text);
CREATE OR REPLACE FUNCTION get_motorway_penalty(target_fuel_type TEXT)
RETURNS TABLE (
    motorway VARCHAR,
    motorway_avg NUMERIC,
    national_avg NUMERIC,
    penalty NUMERIC
) AS $$
DECLARE
    nat_avg NUMERIC;
BEGIN
    -- Get national average
    SELECT CASE WHEN target_fuel_type = 'E10' THEN petrol_avg ELSE diesel_avg END 
    INTO nat_avg 
    FROM uk_price_history ORDER BY date DESC LIMIT 1;
    
    IF nat_avg IS NULL THEN
        nat_avg := 142.0;
    END IF;

    RETURN QUERY
    WITH latest_prices AS (
        SELECT s.postcode, p.price, p.recorded_at,
               ROW_NUMBER() OVER(PARTITION BY s.id ORDER BY p.recorded_at DESC) as rn
        FROM stations s
        JOIN prices p ON p.station_id = s.id
        WHERE p.fuel_type = target_fuel_type
        AND s.is_motorway = TRUE
    ),
    current_prices AS (
        SELECT postcode, price FROM latest_prices WHERE rn = 1
    )
    SELECT
        REPLACE(m.motorway::VARCHAR, ':', '')::VARCHAR AS motorway,
        ROUND(AVG(cp.price), 1)::NUMERIC AS motorway_avg,
        ROUND(nat_avg, 1)::NUMERIC AS national_avg,
        ROUND(AVG(cp.price) - nat_avg, 1)::NUMERIC AS penalty
    FROM motorway_services m
    JOIN current_prices cp ON cp.postcode ILIKE SUBSTRING(m.postcode FROM 1 FOR LENGTH(m.postcode)-2) || '%'
    WHERE m.motorway IN ('M1', 'M6', 'M4', 'M25')
    GROUP BY m.motorway
    HAVING AVG(cp.price) > 0
    ORDER BY penalty DESC;
END;
$$ LANGUAGE plpgsql STABLE;

NOTIFY pgrst, 'reload schema';
