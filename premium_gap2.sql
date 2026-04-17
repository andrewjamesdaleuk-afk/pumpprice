
DROP FUNCTION IF EXISTS get_premium_gap_by_brand();
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
    WITH latest_prices AS (
        SELECT s.brand as raw_brand, p.fuel_type, p.price, p.recorded_at,
               ROW_NUMBER() OVER(PARTITION BY p.station_id, p.fuel_type ORDER BY p.recorded_at DESC) as rn
        FROM stations s
        JOIN prices p ON p.station_id = s.id
        WHERE p.fuel_type IN (target_fuel_type, premium_type)
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
            fuel_type, 
            price 
        FROM latest_prices WHERE rn = 1
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
