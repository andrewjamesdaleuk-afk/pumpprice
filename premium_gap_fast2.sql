DROP FUNCTION IF EXISTS get_premium_gap_by_brand(text);

CREATE OR REPLACE FUNCTION get_premium_gap_by_brand(target_fuel_type TEXT)
RETURNS TABLE (
    brand VARCHAR,
    standard NUMERIC,
    premium NUMERIC,
    gap NUMERIC
) AS $$
DECLARE
    premium_type TEXT;
BEGIN
    IF target_fuel_type = 'E10' THEN
        premium_type := 'E5';
    ELSE
        premium_type := 'SDV';
    END IF;

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
    latest_standard AS (
        SELECT DISTINCT ON (station_id) station_id, p.price as item_price 
        FROM prices p
        WHERE fuel_type = target_fuel_type AND recorded_at > NOW() - INTERVAL '7 days'
        ORDER BY station_id, recorded_at DESC
    ),
    latest_premium AS (
        SELECT DISTINCT ON (station_id) station_id, p.price as item_price 
        FROM prices p
        WHERE fuel_type = premium_type AND recorded_at > NOW() - INTERVAL '7 days'
        ORDER BY station_id, recorded_at DESC
    ),
    brand_averages AS (
        SELECT c.brand_name,
               AVG(ls.item_price) AS avg_standard,
               AVG(lp.item_price) AS avg_premium,
               COUNT(ls.item_price) AS count_standard,
               COUNT(lp.item_price) AS count_premium
        FROM current_prices c
        JOIN latest_standard ls ON c.station_id = ls.station_id
        JOIN latest_premium lp ON c.station_id = lp.station_id
        GROUP BY c.brand_name
    )
    SELECT brand_name::VARCHAR as brand,
           ROUND(avg_standard, 1)::NUMERIC as standard,
           ROUND(avg_premium, 1)::NUMERIC as premium,
           ROUND(avg_premium - avg_standard, 1)::NUMERIC as gap
    FROM brand_averages
    WHERE count_standard > 20 AND count_premium > 10
    ORDER BY gap DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_premium_gap_by_brand(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
