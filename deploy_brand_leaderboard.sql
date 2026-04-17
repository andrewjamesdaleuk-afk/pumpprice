CREATE OR REPLACE FUNCTION get_brand_leaderboard(target_fuel_type TEXT)
RETURNS TABLE (
    brand VARCHAR,
    price NUMERIC,
    station_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_prices AS (
        SELECT s.brand as raw_brand, pr.price as item_price
        FROM stations s
        JOIN LATERAL (
            SELECT p.price 
            FROM prices p 
            WHERE p.station_id = s.id AND p.fuel_type = target_fuel_type 
            ORDER BY p.recorded_at DESC 
            LIMIT 1
        ) pr ON true
    ),
    current_prices AS (
        SELECT 
            -- normalize brand names
            CASE 
                WHEN UPPER(raw_brand) = 'ESSO' THEN 'Esso'
                WHEN UPPER(raw_brand) = 'SHELL' THEN 'Shell'
                WHEN UPPER(raw_brand) = 'BP' THEN 'BP'
                WHEN UPPER(raw_brand) = 'TEXACO' THEN 'Texaco'
                WHEN UPPER(raw_brand) = 'JET' THEN 'Jet'
                WHEN UPPER(raw_brand) = 'TESCO' THEN 'Tesco'
                WHEN UPPER(raw_brand) = 'ASDA' THEN 'Asda'
                WHEN UPPER(raw_brand) = 'SAINSBURY''S' THEN 'Sainsbury''s'
                WHEN UPPER(raw_brand) = 'MORRISONS' THEN 'Morrisons'
                ELSE INITCAP(raw_brand)
            END as brand_name, 
            item_price 
        FROM latest_prices
    )
    SELECT cp.brand_name::VARCHAR as brand,
           ROUND(AVG(cp.item_price), 1)::NUMERIC as price,
           COUNT(*)::BIGINT as station_count
    FROM current_prices cp
    GROUP BY cp.brand_name
    HAVING COUNT(*) > 50 -- Filter out tiny obscure brands
    ORDER BY ROUND(AVG(cp.item_price), 1) ASC;
END;
$$ LANGUAGE plpgsql STABLE;

NOTIFY pgrst, 'reload schema';
