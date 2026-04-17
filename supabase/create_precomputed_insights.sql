CREATE TABLE IF NOT EXISTS public.precomputed_insights (
    id TEXT PRIMARY KEY,
    insight_type TEXT NOT NULL,
    fuel_type VARCHAR(10) NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and add a policy to allow public reads
ALTER TABLE public.precomputed_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to precomputed_insights"
ON public.precomputed_insights
FOR SELECT
TO public
USING (true);
