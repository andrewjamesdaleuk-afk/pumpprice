CREATE OR REPLACE FUNCTION get_brand_leaderboard(target_fuel_type TEXT)
RETURNS TABLE (
    brand VARCHAR,
    price NUMERIC,
    station_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH current_prices AS (
        SELECT s.id as station_id,
            CASE 
                WHEN UPPER(s.brand) = 'ESSO' THEN 'Esso'
                WHEN UPPER(s.brand) = 'SHELL' THEN 'Shell'
                WHEN UPPER(s.brand) = 'BP' THEN 'BP'
                WHEN UPPER(s.brand) = 'TEXACO' THEN 'Texaco'
                WHEN UPPER(s.brand) = 'JET' THEN 'Jet'
                WHEN UPPER(s.brand) = 'TESCO' THEN 'Tesco'
                WHEN UPPER(s.brand) = 'ASDA' THEN 'Asda'
                WHEN UPPER(s.brand) = 'SAINSBURY''S' THEN 'Sainsbury''s'
                WHEN UPPER(s.brand) = 'MORRISONS' THEN 'Morrisons'
                ELSE INITCAP(s.brand)
            END as brand_name
        FROM stations s
    ),
    latest_fuel AS (
        SELECT DISTINCT ON (station_id) station_id, p.price as item_price 
        FROM prices p
        WHERE fuel_type = target_fuel_type AND p.recorded_at > NOW() - INTERVAL '30 days' AND p.price > 130 AND p.price < 210
        ORDER BY station_id, p.recorded_at DESC
    ),
    brand_averages AS (
        SELECT c.brand_name,
               AVG(lf.item_price) AS avg_price,
               COUNT(lf.item_price) AS count_fuel
        FROM current_prices c
        JOIN latest_fuel lf ON c.station_id = lf.station_id
        GROUP BY c.brand_name
    )
    SELECT brand_name::VARCHAR as brand,
           (TRUNC(avg_price) + 0.9)::NUMERIC as price,
           count_fuel::BIGINT as station_count
    FROM brand_averages
    WHERE count_fuel > 20
    ORDER BY price ASC;
END;
$$ LANGUAGE plpgsql STABLE;
