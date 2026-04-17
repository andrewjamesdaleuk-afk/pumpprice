-- Highly Optimized Expanded City List (1-day window + limited scan)
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

    -- City Stats Calculation (Expanded List)
    WITH major_cities(city_name, geom) AS (
        VALUES 
            ('London', ST_SetSRID(ST_Point(-0.128269, 51.507211), 4326)::geography),
            ('Birmingham', ST_SetSRID(ST_Point(-1.898007, 52.477677), 4326)::geography),
            ('Glasgow', ST_SetSRID(ST_Point(-4.249812, 55.860531), 4326)::geography),
            ('Bristol', ST_SetSRID(ST_Point(-2.60207, 51.452605), 4326)::geography),
            ('Manchester', ST_SetSRID(ST_Point(-2.242935, 53.480597), 4326)::geography),
            ('Sheffield', ST_SetSRID(ST_Point(-1.471485, 53.381091), 4326)::geography),
            ('Leeds', ST_SetSRID(ST_Point(-1.548522, 53.802177), 4326)::geography),
            ('Edinburgh', ST_SetSRID(ST_Point(-3.19036, 55.950317), 4326)::geography),
            ('Leicester', ST_SetSRID(ST_Point(-1.135125, 52.63208), 4326)::geography),
            ('Coventry', ST_SetSRID(ST_Point(-3.180492, 51.476633), 4326)::geography),
            ('Cardiff', ST_SetSRID(ST_Point(-3.180492, 51.476633), 4326)::geography),
            ('Bradford', ST_SetSRID(ST_Point(-1.753296, 53.792327), 4326)::geography),
            ('Nottingham', ST_SetSRID(ST_Point(-1.135125, 52.63208), 4326)::geography),
            ('Kingston upon Hull', ST_SetSRID(ST_Point(-1.753296, 53.792327), 4326)::geography),
            ('Belfast', ST_SetSRID(ST_Point(-5.930077, 54.596633), 4326)::geography),
            ('Derby', ST_SetSRID(ST_Point(-1.152021, 52.952374), 4326)::geography),
            ('Southampton', ST_SetSRID(ST_Point(-1.406971, 50.907674), 4326)::geography),
            ('Portsmouth', ST_SetSRID(ST_Point(-1.406971, 50.907674), 4326)::geography),
            ('Plymouth', ST_SetSRID(ST_Point(-1.102846, 50.790302), 4326)::geography),
            ('Brighton and Hove', ST_SetSRID(ST_Point(-0.140951, 50.820853), 4326)::geography),
            ('Reading', ST_SetSRID(ST_Point(-0.971855, 51.456322), 4326)::geography),
            ('Northampton', ST_SetSRID(ST_Point(-1.152021, 52.952374), 4326)::geography),
            ('Bolton', ST_SetSRID(ST_Point(-2.430772, 53.578247), 4326)::geography),
            ('Bournemouth', ST_SetSRID(ST_Point(-0.140951, 50.820853), 4326)::geography),
            ('Norwich', ST_SetSRID(ST_Point(-0.971855, 51.456322), 4326)::geography),
            ('Swindon', ST_SetSRID(ST_Point(-0.140951, 50.820853), 4326)::geography),
            ('Swansea', ST_SetSRID(ST_Point(-3.180492, 51.476633), 4326)::geography),
            ('Southend-on-Sea', ST_SetSRID(ST_Point(0.712069, 51.539173), 4326)::geography),
            ('Middlesbrough', ST_SetSRID(ST_Point(-1.753296, 53.792327), 4326)::geography),
            ('Warrington', ST_SetSRID(ST_Point(-2.430772, 53.578247), 4326)::geography),
            ('Slough', ST_SetSRID(ST_Point(-0.971855, 51.456322), 4326)::geography),
            ('Huddersfield', ST_SetSRID(ST_Point(-1.753296, 53.792327), 4326)::geography),
            ('Oxford', ST_SetSRID(ST_Point(-0.971855, 51.456322), 4326)::geography),
            ('York', ST_SetSRID(ST_Point(-1.548522, 53.802177), 4326)::geography),
            ('Poole', ST_SetSRID(ST_Point(-0.140951, 50.820853), 4326)::geography),
            ('Ipswich', ST_SetSRID(ST_Point(0.712069, 51.539173), 4326)::geography),
            ('Cambridge', ST_SetSRID(ST_Point(-0.971855, 51.456322), 4326)::geography),
            ('Dundee', ST_SetSRID(ST_Point(-4.249812, 55.860531), 4326)::geography),
            ('Gloucester', ST_SetSRID(ST_Point(-2.60207, 51.452605), 4326)::geography),
            ('Blackpool', ST_SetSRID(ST_Point(-2.430772, 53.578247), 4326)::geography),
            ('Sale', ST_SetSRID(ST_Point(-2.430772, 53.578247), 4326)::geography),
            ('Colchester', ST_SetSRID(ST_Point(0.712069, 51.539173), 4326)::geography),
            ('Newport', ST_SetSRID(ST_Point(-3.180492, 51.476633), 4326)::geography),
            ('Maidstone', ST_SetSRID(ST_Point(-1.406971, 50.907674), 4326)::geography),
            ('Chelmsford', ST_SetSRID(ST_Point(0.712069, 51.539173), 4326)::geography),
            ('Doncaster', ST_SetSRID(ST_Point(-1.753296, 53.792327), 4326)::geography),
            ('Rotherham', ST_SetSRID(ST_Point(-1.471485, 53.381091), 4326)::geography),
            ('Stockport', ST_SetSRID(ST_Point(-2.242935, 53.480597), 4326)::geography),
            ('Basildon', ST_SetSRID(ST_Point(0.712069, 51.539173), 4326)::geography),
            ('Crawley', ST_SetSRID(ST_Point(0.712069, 51.539173), 4326)::geography),
            (' Rochdale', ST_SetSRID(ST_Point(-2.242935, 53.480597), 4326)::geography),
            ('Halifax', ST_SetSRID(ST_Point(-1.753296, 53.792327), 4326)::geography),
            ('Oldham', ST_SetSRID(ST_Point(-2.242935, 53.480597), 4326)::geography),
            ('Walsall', ST_SetSRID(ST_Point(-1.898007, 52.477677), 4326)::geography),
            ('Aberdeen', ST_SetSRID(ST_Point(-4.249812, 55.860531), 4326)::geography),
            ('Guildford', ST_SetSRID(ST_Point(-1.406971, 50.907674), 4326)::geography),
            ('Worcester', ST_SetSRID(ST_Point(-1.898007, 52.477677), 4326)::geography),
            ('Dartford', ST_SetSRID(ST_Point(-1.406971, 50.907674), 4326)::geography),
            ('Bury', ST_SetSRID(ST_Point(-2.242935, 53.480597), 4326)::geography),
            ('Carlisle', ST_SetSRID(ST_Point(-4.249812, 55.860531), 4326)::geography),
            ('Lincoln', ST_SetSRID(ST_Point(-1.548522, 53.802177), 4326)::geography),
            ('High Wycombe', ST_SetSRID(ST_Point(-0.971855, 51.456322), 4326)::geography),
            ('Exeter', ST_SetSRID(ST_Point(-1.102846, 50.790302), 4326)::geography),
            ('Preston', ST_SetSRID(ST_Point(-2.242935, 53.480597), 4326)::geography),
            ('Dudley', ST_SetSRID(ST_Point(-1.898007, 52.477677), 4326)::geography),
            ('Ashford', ST_SetSRID(ST_Point(-1.406971, 50.907674), 4326)::geography),
            ('Cheltenham', ST_SetSRID(ST_Point(-2.60207, 51.452605), 4326)::geography),
            ('Torbay', ST_SetSRID(ST_Point(-0.140951, 50.820853), 4326)::geography),
            ('Blackburn', ST_SetSRID(ST_Point(-2.242935, 53.480597), 4326)::geography),
            ('Bath', ST_SetSRID(ST_Point(-2.60207, 51.452605), 4326)::geography),
            ('Taunton', ST_SetSRID(ST_Point(-1.102846, 50.790302), 4326)::geography),
            ('Hastings', ST_SetSRID(ST_Point(-0.140951, 50.820853), 4326)::geography),
            ('Derry', ST_SetSRID(ST_Point(-5.930077, 54.596633), 4326)::geography),
            ('Chesterfield', ST_SetSRID(ST_Point(-1.471485, 53.381091), 4326)::geography)
    ),
    recent_prices AS (
        SELECT station_id, fuel_type, price
        FROM prices
        WHERE recorded_at > NOW() - INTERVAL '24 hours'
    ),
    city_raw_stats AS (
        SELECT 
            c.city_name,
            p.fuel_type,
            AVG(p.price) as avg_p,
            COUNT(*) as cnt
        FROM major_cities c
        JOIN stations s ON ST_DWithin(s.location, c.geom, 8046.72)
        JOIN recent_prices p ON p.station_id = s.id
        GROUP BY c.city_name, p.fuel_type
        HAVING COUNT(*) >= 2
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
