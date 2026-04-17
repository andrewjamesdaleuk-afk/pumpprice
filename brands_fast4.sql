DROP FUNCTION IF EXISTS get_brand_leaderboard(text);

CREATE OR REPLACE FUNCTION get_brand_leaderboard(target_fuel_type TEXT)
RETURNS TABLE (
    brand VARCHAR,
    price NUMERIC,
    station_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_prices AS (
        SELECT DISTINCT ON (station_id) station_id, p.price as item_price 
        FROM prices p
        WHERE fuel_type = target_fuel_type AND recorded_at > NOW() - INTERVAL '2 days'
        ORDER BY station_id, recorded_at DESC
    ),
    current_prices AS (
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
    )
    SELECT c.brand_name::VARCHAR as brand,
           (TRUNC(AVG(lp.item_price)) + 0.9)::NUMERIC as price,
           COUNT(lp.item_price)::BIGINT as station_count
    FROM current_prices c
    JOIN latest_prices lp ON c.station_id = lp.station_id
    GROUP BY c.brand_name
    HAVING COUNT(lp.item_price) > 20
    ORDER BY price ASC;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_brand_leaderboard(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
