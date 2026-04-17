-- Update refresh_all_insights to call the split functions
CREATE OR REPLACE FUNCTION refresh_all_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This now calls refresh_brand_insights and refresh_city_insights
    PERFORM refresh_brand_insights();
    PERFORM refresh_city_insights();
END;
$$;
