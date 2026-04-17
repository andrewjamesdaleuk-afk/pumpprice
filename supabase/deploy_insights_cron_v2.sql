CREATE OR REPLACE FUNCTION refresh_all_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    leaderboard_e10 JSONB;
    leaderboard_b7 JSONB;
    cheapest_e10 JSONB;
    cheapest_b7 JSONB;
    expensive_e10 JSONB;
    expensive_b7 JSONB;
    nat_avg_e10 NUMERIC;
    nat_avg_b7 NUMERIC;
BEGIN
    -- Get current national averages for diff calculation
    SELECT petrol_avg INTO nat_avg_e10 FROM uk_price_history ORDER BY date DESC LIMIT 1;
    SELECT diesel_avg INTO nat_avg_b7 FROM uk_price_history ORDER BY date DESC LIMIT 1;
    
    nat_avg_e10 := COALESCE(nat_avg_e10, 145.0);
    nat_avg_b7 := COALESCE(nat_avg_b7, 155.0);

    -- 1. Brand Leaderboard
    SELECT jsonb_agg(row_to_json(t)) INTO leaderboard_e10
    FROM (SELECT * FROM get_brand_leaderboard('E10') LIMIT 10) t;
    
    SELECT jsonb_agg(row_to_json(t)) INTO leaderboard_b7
    FROM (SELECT * FROM get_brand_leaderboard('B7') LIMIT 10) t;

    -- 2. Comprehensive City Stats (Calculating everything in one go)
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
    latest_prices AS (
        SELECT s.id, s.location, p.price, p.fuel_type,
               ROW_NUMBER() OVER(PARTITION BY s.id, p.fuel_type ORDER BY p.recorded_at DESC) as rn
        FROM stations s
        JOIN prices p ON p.station_id = s.id
    ),
    current_prices AS (
        SELECT * FROM latest_prices WHERE rn = 1
    ),
    city_raw_stats AS (
        SELECT 
            c.city_name,
            cp.fuel_type,
            AVG(cp.price) as avg_p,
            MIN(cp.price) as min_p,
            MAX(cp.price) as max_p,
            COUNT(*) as cnt
        FROM major_cities c
        JOIN current_prices cp ON ST_DWithin(cp.location, c.geom, 8046.72)
        GROUP BY c.city_name, cp.fuel_type
    ),
    city_formatted AS (
        SELECT 
            city_name,
            -- E10 Stats object
            jsonb_build_object(
                'avg', ROUND(MAX(CASE WHEN fuel_type = 'E10' THEN avg_p END), 1),
                'min', ROUND(MAX(CASE WHEN fuel_type = 'E10' THEN min_p END), 1),
                'max', ROUND(MAX(CASE WHEN fuel_type = 'E10' THEN max_p END), 1),
                'count', MAX(CASE WHEN fuel_type = 'E10' THEN cnt END)
            ) as e10_stats,
            -- B7 Stats object
            jsonb_build_object(
                'avg', ROUND(MAX(CASE WHEN fuel_type = 'B7' THEN avg_p END), 1),
                'min', ROUND(MAX(CASE WHEN fuel_type = 'B7' THEN min_p END), 1),
                'max', ROUND(MAX(CASE WHEN fuel_type = 'B7' THEN max_p END), 1),
                'count', MAX(CASE WHEN fuel_type = 'B7' THEN cnt END)
            ) as b7_stats
        FROM city_raw_stats
        GROUP BY city_name
    )
    -- Now pick top cheapest and expensive from the formatted list
    SELECT 
        (SELECT jsonb_agg(jsonb_build_object(
            'city', city_name,
            'price', (e10_stats->>'avg')::numeric,
            'diff', ROUND((e10_stats->>'avg')::numeric - nat_avg_e10, 1),
            'petrolStats', e10_stats,
            'dieselStats', b7_stats
        )) FROM (SELECT * FROM city_formatted WHERE (e10_stats->>'count')::int > 0 ORDER BY (e10_stats->>'avg')::numeric ASC LIMIT 5) t) INTO cheapest_e10;

    SELECT 
        (SELECT jsonb_agg(jsonb_build_object(
            'city', city_name,
            'price', (b7_stats->>'avg')::numeric,
            'diff', ROUND((b7_stats->>'avg')::numeric - nat_avg_b7, 1),
            'petrolStats', e10_stats,
            'dieselStats', b7_stats
        )) FROM (SELECT * FROM city_formatted WHERE (b7_stats->>'count')::int > 0 ORDER BY (b7_stats->>'avg')::numeric ASC LIMIT 5) t) INTO cheapest_b7;

    SELECT 
        (SELECT jsonb_agg(jsonb_build_object(
            'city', city_name,
            'price', (e10_stats->>'avg')::numeric,
            'diff', ROUND((e10_stats->>'avg')::numeric - nat_avg_e10, 1),
            'petrolStats', e10_stats,
            'dieselStats', b7_stats
        )) FROM (SELECT * FROM city_formatted WHERE (e10_stats->>'count')::int > 0 ORDER BY (e10_stats->>'avg')::numeric DESC LIMIT 5) t) INTO expensive_e10;

    SELECT 
        (SELECT jsonb_agg(jsonb_build_object(
            'city', city_name,
            'price', (b7_stats->>'avg')::numeric,
            'diff', ROUND((b7_stats->>'avg')::numeric - nat_avg_b7, 1),
            'petrolStats', e10_stats,
            'dieselStats', b7_stats
        )) FROM (SELECT * FROM city_formatted WHERE (b7_stats->>'count')::int > 0 ORDER BY (b7_stats->>'avg')::numeric DESC LIMIT 5) t) INTO expensive_b7;

    -- 4. Upsert all results
    INSERT INTO public.precomputed_insights (id, insight_type, fuel_type, data, updated_at)
    VALUES 
        ('brand_leaderboard_e10', 'brand_leaderboard', 'E10', COALESCE(leaderboard_e10, '[]'::jsonb), NOW()),
        ('brand_leaderboard_b7', 'brand_leaderboard', 'B7', COALESCE(leaderboard_b7, '[]'::jsonb), NOW()),
        ('cheapest_cities_e10', 'cheapest_cities', 'E10', COALESCE(cheapest_e10, '[]'::jsonb), NOW()),
        ('cheapest_cities_b7', 'cheapest_cities', 'B7', COALESCE(cheapest_b7, '[]'::jsonb), NOW()),
        ('expensive_cities_e10', 'expensive_cities', 'E10', COALESCE(expensive_e10, '[]'::jsonb), NOW()),
        ('expensive_cities_b7', 'expensive_cities', 'B7', COALESCE(expensive_b7, '[]'::jsonb), NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
END;
$$;
