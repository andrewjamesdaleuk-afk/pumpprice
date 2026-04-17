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
    WITH current_prices AS (
        SELECT s.id as station_id,
            CASE 
                WHEN UPPER(s.brand) IN ('TESCO', 'ASDA', 'SAINSBURY''S', 'MORRISONS') THEN true
                ELSE false
            END as is_supermarket
        FROM stations s
    ),
    latest_petrol AS (
        SELECT DISTINCT ON (station_id) station_id, p.price as item_price 
        FROM prices p
        WHERE fuel_type = 'E10' AND recorded_at > NOW() - INTERVAL '7 days'
        ORDER BY station_id, recorded_at DESC
    ),
    latest_diesel AS (
        SELECT DISTINCT ON (station_id) station_id, p.price as item_price 
        FROM prices p
        WHERE fuel_type = 'B7' AND recorded_at > NOW() - INTERVAL '7 days'
        ORDER BY station_id, recorded_at DESC
    ),
    national_avgs AS (
        SELECT 
            ROUND(AVG(lp.item_price), 1)::NUMERIC as nat_petrol,
            ROUND(AVG(ld.item_price), 1)::NUMERIC as nat_diesel
        FROM current_prices c
        LEFT JOIN latest_petrol lp ON c.station_id = lp.station_id
        LEFT JOIN latest_diesel ld ON c.station_id = ld.station_id
    )
    SELECT 
        'UK Supermarkets'::VARCHAR as region,
        ROUND(AVG(lp.item_price), 1)::NUMERIC as petrolAvg,
        ROUND(AVG(ld.item_price), 1)::NUMERIC as dieselAvg,
        n.nat_petrol as nationalPetrol,
        n.nat_diesel as nationalDiesel
    FROM current_prices c
    CROSS JOIN national_avgs n
    LEFT JOIN latest_petrol lp ON c.station_id = lp.station_id
    LEFT JOIN latest_diesel ld ON c.station_id = ld.station_id
    WHERE c.is_supermarket = true
    GROUP BY n.nat_petrol, n.nat_diesel;
END;
$$ LANGUAGE plpgsql STABLE;
