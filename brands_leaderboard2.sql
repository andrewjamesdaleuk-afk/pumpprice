
CREATE OR REPLACE FUNCTION get_brand_leaderboard(target_fuel_type TEXT)
RETURNS TABLE (
    brand VARCHAR,
    price NUMERIC,
    station_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_prices AS (
        SELECT s.brand as raw_brand, p.price, p.recorded_at,
               ROW_NUMBER() OVER(PARTITION BY p.station_id ORDER BY p.recorded_at DESC) as rn
        FROM stations s
        JOIN prices p ON p.station_id = s.id
        WHERE p.fuel_type = target_fuel_type
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
            price 
        FROM latest_prices WHERE rn = 1
    )
    SELECT brand_name::VARCHAR as brand,
           ROUND(AVG(price), 1)::NUMERIC as price,
           COUNT(*)::BIGINT as station_count
    FROM current_prices
    GROUP BY brand_name
    HAVING COUNT(*) > 50 -- Filter out tiny obscure brands
    ORDER BY price ASC;
END;
$$ LANGUAGE plpgsql STABLE;

NOTIFY pgrst, 'reload schema';
