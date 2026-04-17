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
                WHEN address ILIKE '%M1%' THEN 'M1'
                WHEN address ILIKE '%M6%' THEN 'M6'
                WHEN address ILIKE '%M4%' THEN 'M4'
                WHEN address ILIKE '%M25%' THEN 'M25'
                WHEN address ILIKE '%M5%' THEN 'M5'
            END as mw,
            s.id as station_id
        FROM stations s
        WHERE is_motorway = true OR address ILIKE '%Services%'
    ),
    motorway_prices AS (
        SELECT md.mw, lp.price
        FROM motorway_data md
        JOIN latest_prices lp ON md.station_id = lp.station_id
        WHERE md.mw IS NOT NULL
    )
    SELECT 
        m.mw::VARCHAR as motorway,
        (TRUNC(AVG(m.price)) + 0.9)::NUMERIC as motorway_avg,
        n.avg_price as national_avg,
        ((TRUNC(AVG(m.price)) + 0.9) - n.avg_price)::NUMERIC as penalty
    FROM motorway_prices m
    CROSS JOIN national_avg_data n
    GROUP BY m.mw, n.avg_price
    ORDER BY penalty DESC;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_motorway_penalty(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
