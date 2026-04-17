DROP FUNCTION IF EXISTS get_supermarket_sweep(text);

CREATE OR REPLACE FUNCTION get_supermarket_sweep(target_fuel_type TEXT)
RETURNS TABLE (
    region VARCHAR,
    petrolAvg NUMERIC,
    dieselAvg NUMERIC,
    nationalPetrol NUMERIC,
    nationalDiesel NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_petrol AS (
        SELECT DISTINCT ON (station_id) station_id, price 
        FROM prices 
        WHERE fuel_type = 'E10' AND recorded_at > NOW() - INTERVAL '3 days'
        ORDER BY station_id, recorded_at DESC
    ),
    latest_diesel AS (
        SELECT DISTINCT ON (station_id) station_id, price 
        FROM prices 
        WHERE fuel_type = 'B7' AND recorded_at > NOW() - INTERVAL '3 days'
        ORDER BY station_id, recorded_at DESC
    ),
    national_avgs AS (
        SELECT 
            (TRUNC(AVG(lp.price)) + 0.9)::NUMERIC as nat_petrol,
            (TRUNC(AVG(ld.price)) + 0.9)::NUMERIC as nat_diesel
        FROM stations s
        LEFT JOIN latest_petrol lp ON s.id = lp.station_id
        LEFT JOIN latest_diesel ld ON s.id = ld.station_id
    ),
    regional_data AS (
        SELECT 
            CASE 
                WHEN s.postcode LIKE 'M%' OR s.postcode LIKE 'L%' OR s.postcode LIKE 'WA%' OR s.postcode LIKE 'CH%' THEN 'North West'
                WHEN s.postcode LIKE 'B%' OR s.postcode LIKE 'CV%' OR s.postcode LIKE 'LE%' OR s.postcode LIKE 'NG%' THEN 'Midlands'
                WHEN s.postcode LIKE 'NE%' OR s.postcode LIKE 'SR%' OR s.postcode LIKE 'DH%' OR s.postcode LIKE 'TS%' THEN 'North East'
                WHEN s.postcode LIKE 'EH%' OR s.postcode LIKE 'G%' OR s.postcode LIKE 'AB%' OR s.postcode LIKE 'DD%' THEN 'Scotland'
                WHEN s.postcode LIKE 'BS%' OR s.postcode LIKE 'BA%' OR s.postcode LIKE 'EX%' OR s.postcode LIKE 'PL%' THEN 'South West'
                WHEN s.postcode LIKE 'BN%' OR s.postcode LIKE 'GU%' OR s.postcode LIKE 'PO%' OR s.postcode LIKE 'SO%' THEN 'South East'
                ELSE 'Other'
            END as mapped_region,
            lp.price as petrol_price,
            ld.price as diesel_price
        FROM stations s
        LEFT JOIN latest_petrol lp ON s.id = lp.station_id
        LEFT JOIN latest_diesel ld ON s.id = ld.station_id
        WHERE UPPER(s.brand) IN ('TESCO', 'ASDA', 'SAINSBURY''S', 'MORRISONS')
    )
    SELECT 
        r.mapped_region::VARCHAR as region,
        (TRUNC(AVG(r.petrol_price)) + 0.9)::NUMERIC as petrolAvg,
        (TRUNC(AVG(r.diesel_price)) + 0.9)::NUMERIC as dieselAvg,
        n.nat_petrol as nationalPetrol,
        n.nat_diesel as nationalDiesel
    FROM regional_data r
    CROSS JOIN national_avgs n
    WHERE r.mapped_region != 'Other'
    GROUP BY r.mapped_region, n.nat_petrol, n.nat_diesel
    ORDER BY region;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_supermarket_sweep(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
