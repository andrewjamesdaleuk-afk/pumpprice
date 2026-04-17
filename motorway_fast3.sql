DROP FUNCTION IF EXISTS get_motorway_penalty(text);

CREATE OR REPLACE FUNCTION get_motorway_penalty(target_fuel_type TEXT)
RETURNS TABLE (
    motorway VARCHAR,
    motorway_avg NUMERIC,
    national_avg NUMERIC,
    penalty NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_prices AS (
        SELECT DISTINCT ON (station_id) station_id, price 
        FROM prices 
        WHERE fuel_type = target_fuel_type AND recorded_at > NOW() - INTERVAL '3 days'
        ORDER BY station_id, recorded_at DESC
    ),
    national_avg_data AS (
        SELECT (TRUNC(AVG(price)) + 0.9)::NUMERIC as avg_price 
        FROM latest_prices
    ),
    motorway_data AS (
        SELECT 
            CASE 
                WHEN s.address ILIKE '%M1%' THEN 'M1'
                WHEN s.address ILIKE '%M6%' THEN 'M6'
                WHEN s.address ILIKE '%M4%' THEN 'M4'
                WHEN s.address ILIKE '%M25%' THEN 'M25'
                WHEN s.address ILIKE '%M5%' THEN 'M5'
            END as mw,
            lp.price
        FROM stations s
        JOIN latest_prices lp ON s.id = lp.station_id
        WHERE s.address ILIKE '%Services%' OR s.address ILIKE '%Motorway%'
    )
    SELECT 
        m.mw::VARCHAR as motorway,
        (TRUNC(AVG(m.price)) + 0.9)::NUMERIC as motorway_avg,
        n.avg_price as national_avg,
        ((TRUNC(AVG(m.price)) + 0.9) - n.avg_price)::NUMERIC as penalty
    FROM motorway_data m
    CROSS JOIN national_avg_data n
    WHERE m.mw IS NOT NULL
    GROUP BY m.mw, n.avg_price
    HAVING COUNT(m.price) > 5
    ORDER BY penalty DESC;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_motorway_penalty(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
