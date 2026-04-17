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
        SELECT 
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
            END as brand_name,
            p.fuel_type,
            p.price
        FROM stations s
        JOIN LATERAL (
            SELECT fuel_type, price
            FROM prices
            WHERE station_id = s.id AND fuel_type IN (target_fuel_type, premium_type)
            ORDER BY recorded_at DESC
            LIMIT 2
        ) p ON true
    ),
    brand_averages AS (
        SELECT brand_name,
               AVG(CASE WHEN fuel_type = target_fuel_type THEN price END) AS avg_standard,
               AVG(CASE WHEN fuel_type = premium_type THEN price END) AS avg_premium,
               COUNT(CASE WHEN fuel_type = target_fuel_type THEN 1 END) AS count_standard,
               COUNT(CASE WHEN fuel_type = premium_type THEN 1 END) AS count_premium
        FROM current_prices
        GROUP BY brand_name
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
