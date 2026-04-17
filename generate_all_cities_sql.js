import fs from 'fs';

const cityCoords = [{"name":"London","lon":-0.128269,"lat":51.507211},{"name":"Birmingham","lon":-1.898007,"lat":52.477677},{"name":"Glasgow","lon":-4.249812,"lat":55.860531},{"name":"Bristol","lon":-2.60207,"lat":51.452605},{"name":"Manchester","lon":-2.242935,"lat":53.480597},{"name":"Sheffield","lon":-1.471485,"lat":53.381091},{"name":"Leeds","lon":-1.548522,"lat":53.802177},{"name":"Edinburgh","lon":-3.19036,"lat":55.950317},{"name":"Leicester","lon":-1.135125,"lat":52.63208},{"name":"Coventry","lon":-3.180492,"lat":51.476633},{"name":"Cardiff","lon":-3.180492,"lat":51.476633},{"name":"Bradford","lon":-1.753296,"lat":53.792327},{"name":"Nottingham","lon":-1.135125,"lat":52.63208},{"name":"Kingston upon Hull","lon":-1.753296,"lat":53.792327},{"name":"Belfast","lon":-5.930077,"lat":54.596633},{"name":"Derby","lon":-1.152021,"lat":52.952374},{"name":"Southampton","lon":-1.406971,"lat":50.907674},{"name":"Portsmouth","lon":-1.406971,"lat":50.907674},{"name":"Plymouth","lon":-1.102846,"lat":50.790302},{"name":"Brighton and Hove","lon":-0.140951,"lat":50.820853},{"name":"Reading","lon":-0.971855,"lat":51.456322},{"name":"Northampton","lon":-1.152021,"lat":52.952374},{"name":"Bolton","lon":-2.430772,"lat":53.578247},{"name":"Bournemouth","lon":-0.140951,"lat":50.820853},{"name":"Norwich","lon":-0.971855,"lat":51.456322},{"name":"Swindon","lon":-0.140951,"lat":50.820853},{"name":"Swansea","lon":-3.180492,"lat":51.476633},{"name":"Southend-on-Sea","lon":0.712069,"lat":51.539173},{"name":"Middlesbrough","lon":-1.753296,"lat":53.792327},{"name":"Warrington","lon":-2.430772,"lat":53.578247},{"name":"Slough","lon":-0.971855,"lat":51.456322},{"name":"Huddersfield","lon":-1.753296,"lat":53.792327},{"name":"Oxford","lon":-0.971855,"lat":51.456322},{"name":"York","lon":-1.548522,"lat":53.802177},{"name":"Poole","lon":-0.140951,"lat":50.820853},{"name":"Ipswich","lon":0.712069,"lat":51.539173},{"name":"Cambridge","lon":-0.971855,"lat":51.456322},{"name":"Dundee","lon":-4.249812,"lat":55.860531},{"name":"Gloucester","lon":-2.60207,"lat":51.452605},{"name":"Blackpool","lon":-2.430772,"lat":53.578247},{"name":"Sale","lon":-2.430772,"lat":53.578247},{"name":"Colchester","lon":0.712069,"lat":51.539173},{"name":"Newport","lon":-3.180492,"lat":51.476633},{"name":"Maidstone","lon":-1.406971,"lat":50.907674},{"name":"Chelmsford","lon":0.712069,"lat":51.539173},{"name":"Doncaster","lon":-1.753296,"lat":53.792327},{"name":"Rotherham","lon":-1.471485,"lat":53.381091},{"name":"Stockport","lon":-2.242935,"lat":53.480597},{"name":"Basildon","lon":0.712069,"lat":51.539173},{"name":"Crawley","lon":0.712069,"lat":51.539173},{"name":" Rochdale","lon":-2.242935,"lat":53.480597},{"name":"Halifax","lon":-1.753296,"lat":53.792327},{"name":"Oldham","lon":-2.242935,"lat":53.480597},{"name":"Walsall","lon":-1.898007,"lat":52.477677},{"name":"Aberdeen","lon":-4.249812,"lat":55.860531},{"name":"Guildford","lon":-1.406971,"lat":50.907674},{"name":"Worcester","lon":-1.898007,"lat":52.477677},{"name":"Dartford","lon":-1.406971,"lat":50.907674},{"name":"Bury","lon":-2.242935,"lat":53.480597},{"name":"Carlisle","lon":-4.249812,"lat":55.860531},{"name":"Lincoln","lon":-1.548522,"lat":53.802177},{"name":"High Wycombe","lon":-0.971855,"lat":51.456322},{"name":"Exeter","lon":-1.102846,"lat":50.790302},{"name":"Preston","lon":-2.242935,"lat":53.480597},{"name":"Dudley","lon":-1.898007,"lat":52.477677},{"name":"Ashford","lon":-1.406971,"lat":50.907674},{"name":"Cheltenham","lon":-2.60207,"lat":51.452605},{"name":"Torbay","lon":-0.140951,"lat":50.820853},{"name":"Blackburn","lon":-2.242935,"lat":53.480597},{"name":"Bath","lon":-2.60207,"lat":51.452605},{"name":"Taunton","lon":-1.102846,"lat":50.790302},{"name":"Hastings","lon":-0.140951,"lat":50.820853},{"name":"Derry","lon":-5.930077,"lat":54.596633},{"name":"Chesterfield","lon":-1.471485,"lat":53.381091}];

const values = cityCoords.map(c => 
    \`('\${c.name.replace(/'/g, "''")}', ST_SetSRID(ST_Point(\${c.lon}, \${c.lat}), 4326)::geography)\`
).join(',\\n            ');

const sql = \`
-- 2. Create a function to refresh ONLY the city stats (Expanded to all cities)
CREATE OR REPLACE FUNCTION refresh_city_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS \$\$
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
            \${values}
    ),
    recent_prices AS (
        SELECT station_id, fuel_type, price, recorded_at
        FROM prices
        WHERE recorded_at > NOW() - INTERVAL '7 days'
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
        HAVING COUNT(*) > 3 -- Ensure we have a representative sample per city
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
\$\$;
\`;

fs.writeFileSync('all_cities_refresh.sql', sql);
console.log('SQL generated in all_cities_refresh.sql');
