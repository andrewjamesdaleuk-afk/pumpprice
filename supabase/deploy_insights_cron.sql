-- 1. Create the table for storing precomputed insights
CREATE TABLE IF NOT EXISTS public.precomputed_insights (
    id TEXT PRIMARY KEY,
    insight_type TEXT NOT NULL,
    fuel_type VARCHAR(10) NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security and allow public reads
ALTER TABLE public.precomputed_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to precomputed_insights" ON public.precomputed_insights;
CREATE POLICY "Allow public read access to precomputed_insights"
ON public.precomputed_insights
FOR SELECT
TO public
USING (true);

-- 3. Create a stored procedure to calculate and refresh all 3 insights
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
BEGIN
    -- Insight 1: Brand Leaderboards
    SELECT jsonb_agg(row_to_json(t)) INTO leaderboard_e10
    FROM (SELECT * FROM get_brand_leaderboard('E10') LIMIT 10) t;
    
    SELECT jsonb_agg(row_to_json(t)) INTO leaderboard_b7
    FROM (SELECT * FROM get_brand_leaderboard('B7') LIMIT 10) t;

    -- Insight 2: Cheapest Cities
    SELECT jsonb_agg(row_to_json(t)) INTO cheapest_e10
    FROM (SELECT * FROM get_cheapest_cities('E10') LIMIT 5) t;
    
    SELECT jsonb_agg(row_to_json(t)) INTO cheapest_b7
    FROM (SELECT * FROM get_cheapest_cities('B7') LIMIT 5) t;

    -- Insight 3: Expensive Cities
    SELECT jsonb_agg(row_to_json(t)) INTO expensive_e10
    FROM (SELECT * FROM get_most_expensive_cities('E10') LIMIT 5) t;
    
    SELECT jsonb_agg(row_to_json(t)) INTO expensive_b7
    FROM (SELECT * FROM get_most_expensive_cities('B7') LIMIT 5) t;

    -- Upsert all calculated results
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

-- 4. Initial population
-- SELECT refresh_all_insights();

-- 5. Schedule (requires pg_cron)
-- SELECT cron.schedule('refresh-insights', '0 */3 * * *', 'SELECT refresh_all_insights();');
