-- 1. Create a function to refresh ONLY the brand leaderboards
CREATE OR REPLACE FUNCTION refresh_brand_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    leaderboard_e10 JSONB;
    leaderboard_b7 JSONB;
BEGIN
    SELECT jsonb_agg(row_to_json(t)) INTO leaderboard_e10
    FROM (SELECT * FROM get_brand_leaderboard('E10') LIMIT 10) t;
    
    SELECT jsonb_agg(row_to_json(t)) INTO leaderboard_b7
    FROM (SELECT * FROM get_brand_leaderboard('B7') LIMIT 10) t;

    INSERT INTO public.precomputed_insights (id, insight_type, fuel_type, data, updated_at)
    VALUES 
        ('brand_leaderboard_e10', 'brand_leaderboard', 'E10', COALESCE(leaderboard_e10, '[]'::jsonb), NOW()),
        ('brand_leaderboard_b7', 'brand_leaderboard', 'B7', COALESCE(leaderboard_b7, '[]'::jsonb), NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
END;
$$;

-- 2. Create a function to refresh ONLY the city stats
CREATE OR REPLACE FUNCTION refresh_city_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cheapest_e10 JSONB;
    cheapest_b7 JSONB;
    expensive_e10 JSONB;
    expensive_b7 JSONB;
    nat_avg_e10 NUMERIC;
    nat_avg_b7 NUMERIC;
BEGIN
    -- Get current national averages
    SELECT petrol_avg INTO nat_avg_e10 FROM uk_price_history ORDER BY date DESC LIMIT 1;
    SELECT diesel_avg INTO nat_avg_b7 FROM uk_price_history ORDER BY date DESC LIMIT 1;
    
    nat_avg_e10 := COALESCE(nat_avg_e10, 145.0);
    nat_avg_b7 := COALESCE(nat_avg_b7, 155.0);

    -- City Stats Calculation
    WITH major_cities(city_name, geom) AS (
        VALUES 
            ('London', ST_SetSRID(ST_Point(-0.1277653, 51.5074456), 4326)::geography),
            ('Birmingham', ST_SetSRID(ST_Point(-1.9026911, 52.4796992), 4326)::geography),
            ('Glasgow', ST_SetSRID(ST_Point(-4.2501687, 55.8611550), 4326)::geography),
            ('Liverpool', ST_SetSRID(ST_Point(-2.9916800, 53.4071991), 4326)::geography),
            ('Bristol', ST_SetSRID(ST_Point(-2.5972985, 51.4538022), 4326)::geography),
            ('Manchester', ST_SetSRID(ST_Point(-2.2451148, 53.4794892), 4326)::geography),
            ('Sheffield', ST_SetSRID(ST_Point(-1.4702278, 53.3806626), 4326)::geography),
            ('Leeds', ST_SetSRID(ST_Point(-1.5437941, 53.7974185), 4326)::geography),
            ('Edinburgh', ST_SetSRID(ST_Point(-3.1883749, 55.9533456), 4326)::geography),
            ('Leicester', ST_SetSRID(ST_Point(-1.1331969, 52.6362000), 4326)::geography),
            ('Coventry', ST_SetSRID(ST_Point(-1.5104770, 52.4081812), 4326)::geography),
            ('Bradford', ST_SetSRID(ST_Point(-1.7519186, 53.7944229), 4326)::geography),
            ('Cardiff', ST_SetSRID(ST_Point(-3.1791934, 51.4816546), 4326)::geography),
            ('Belfast', ST_SetSRID(ST_Point(-5.9277097, 54.5975805), 4326)::geography),
            ('Nottingham', ST_SetSRID(ST_Point(-1.1496461, 52.9534193), 4326)::geography),
            ('Newcastle', ST_SetSRID(ST_Point(-1.6131572, 54.9738474), 4326)::geography),
            ('Southampton', ST_SetSRID(ST_Point(-1.4041890, 50.9025349), 4326)::geography)
    ),
    recent_prices AS (
        SELECT station_id, fuel_type, price, recorded_at
        FROM prices
        WHERE recorded_at > NOW() - INTERVAL '3 days'
    ),
    latest_prices AS (
        SELECT s.id, s.location, p.price, p.fuel_type,
               ROW_NUMBER() OVER(PARTITION BY s.id, p.fuel_type ORDER BY p.recorded_at DESC) as rn
        FROM stations s
        JOIN recent_prices p ON p.station_id = s.id
    ),
    current_prices AS (
        SELECT * FROM latest_prices WHERE rn = 1
    ),
    city_raw_stats AS (
        SELECT 
            c.city_name,
            cp.fuel_type,
            AVG(cp.price) as avg_p,
            COUNT(*) as cnt
        FROM major_cities c
        JOIN current_prices cp ON ST_DWithin(cp.location, c.geom, 8046.72)
        GROUP BY c.city_name, cp.fuel_type
    ),
    final_rankings AS (
        SELECT 
            fuel_type,
            jsonb_agg(jsonb_build_object(
                'city', city_name,
                'price', ROUND(avg_p, 1),
                'diff', ROUND(avg_p - (CASE WHEN fuel_type = 'E10' THEN nat_avg_e10 ELSE nat_avg_b7 END), 1)
            ) ORDER BY avg_p ASC) as cheapest_agg,
            jsonb_agg(jsonb_build_object(
                'city', city_name,
                'price', ROUND(avg_p, 1),
                'diff', ROUND(avg_p - (CASE WHEN fuel_type = 'E10' THEN nat_avg_e10 ELSE nat_avg_b7 END), 1)
            ) ORDER BY avg_p DESC) as expensive_agg
        FROM city_raw_stats
        GROUP BY fuel_type
    )
    SELECT 
        (SELECT cheapest_agg FROM final_rankings WHERE fuel_type = 'E10'),
        (SELECT cheapest_agg FROM final_rankings WHERE fuel_type = 'B7'),
        (SELECT expensive_agg FROM final_rankings WHERE fuel_type = 'E10'),
        (SELECT expensive_agg FROM final_rankings WHERE fuel_type = 'B7')
    INTO cheapest_e10, cheapest_b7, expensive_e10, expensive_b7;

    INSERT INTO public.precomputed_insights (id, insight_type, fuel_type, data, updated_at)
    VALUES 
        ('cheapest_cities_e10', 'cheapest_cities', 'E10', COALESCE(cheapest_e10, '[]'::jsonb), NOW()),
        ('cheapest_cities_b7', 'cheapest_cities', 'B7', COALESCE(cheapest_b7, '[]'::jsonb), NOW()),
        ('expensive_cities_e10', 'expensive_cities', 'E10', COALESCE(expensive_e10, '[]'::jsonb), NOW()),
        ('expensive_cities_b7', 'expensive_cities', 'B7', COALESCE(expensive_b7, '[]'::jsonb), NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
END;
$$;

-- 3. Redefine refresh_all_insights to call the split functions
CREATE OR REPLACE FUNCTION refresh_all_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM refresh_brand_insights();
    PERFORM refresh_city_insights();
END;
$$;
