
DROP FUNCTION IF EXISTS get_stations_along_route;
CREATE OR REPLACE FUNCTION get_stations_along_route(
    route_line GEOGRAPHY,
    buffer_meters DOUBLE PRECISION,
    target_fuel_type TEXT
)
RETURNS TABLE (
    station_id UUID,
    site_id VARCHAR,
    brand VARCHAR,
    postcode VARCHAR,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    price NUMERIC,
    recorded_at TIMESTAMPTZ,
    distance_from_route DOUBLE PRECISION,
    is_motorway BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.site_id,
        s.brand,
        s.postcode,
        ST_Y(s.location::geometry) AS lat,
        ST_X(s.location::geometry) AS lon,
        (
            SELECT p.price 
            FROM prices p 
            WHERE p.station_id = s.id AND p.fuel_type = target_fuel_type
            ORDER BY p.recorded_at DESC 
            LIMIT 1
        ) AS price,
        (
            SELECT p.recorded_at 
            FROM prices p 
            WHERE p.station_id = s.id AND p.fuel_type = target_fuel_type
            ORDER BY p.recorded_at DESC 
            LIMIT 1
        ) AS recorded_at,
        ST_Distance(s.location, route_line) AS distance_from_route,
        s.is_motorway
    FROM 
        stations s
    WHERE 
        ST_DWithin(s.location, route_line, buffer_meters)
    ORDER BY 
        price ASC NULLS LAST, distance_from_route ASC;
END;
$$ LANGUAGE plpgsql STABLE;

NOTIFY pgrst, 'reload schema';
