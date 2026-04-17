
WITH latest_prices AS (
    SELECT s.brand, p.fuel_type, p.price, p.recorded_at,
           ROW_NUMBER() OVER(PARTITION BY p.station_id, p.fuel_type ORDER BY p.recorded_at DESC) as rn
    FROM stations s
    JOIN prices p ON p.station_id = s.id
),
current_prices AS (
    SELECT brand, fuel_type, price FROM latest_prices WHERE rn = 1
),
brand_averages AS (
    SELECT brand,
           AVG(CASE WHEN fuel_type = 'E10' THEN price END) AS avg_e10,
           AVG(CASE WHEN fuel_type = 'E5' THEN price END) AS avg_e5,
           AVG(CASE WHEN fuel_type = 'B7' THEN price END) AS avg_b7,
           AVG(CASE WHEN fuel_type = 'SDV' THEN price END) AS avg_sdv,
           COUNT(CASE WHEN fuel_type = 'E10' THEN 1 END) AS count_e10,
           COUNT(CASE WHEN fuel_type = 'E5' THEN 1 END) AS count_e5
    FROM current_prices
    GROUP BY brand
)
SELECT brand, 
       ROUND(avg_e10, 1) as e10, 
       ROUND(avg_e5, 1) as e5, 
       ROUND(avg_e5 - avg_e10, 1) as petrol_markup,
       ROUND(avg_b7, 1) as b7,
       ROUND(avg_sdv, 1) as sdv,
       ROUND(avg_sdv - avg_b7, 1) as diesel_markup
FROM brand_averages
WHERE count_e10 > 10 AND count_e5 > 10
ORDER BY petrol_markup DESC NULLS LAST;
