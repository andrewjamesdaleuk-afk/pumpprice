CREATE OR REPLACE FUNCTION get_stations_along_route(
    route_line GEOGRAPHY,
    buffer_meters FLOAT,
    target_fuel_type VARCHAR
)
RETURNS TABLE (
    station_id UUID,
    site_id VARCHAR,
    brand VARCHAR,
    postcode VARCHAR,
    lat FLOAT,
    lon FLOAT,
    price NUMERIC,
    distance_from_route FLOAT,
    recorded_at TIMESTAMPTZ
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
        ST_Distance(s.location, route_line) AS distance_from_route,
        (
            SELECT p.recorded_at 
            FROM prices p 
            WHERE p.station_id = s.id AND p.fuel_type = target_fuel_type
            ORDER BY p.recorded_at DESC 
            LIMIT 1
        ) AS recorded_at
    FROM 
        stations s
    WHERE 
        ST_DWithin(s.location, route_line, buffer_meters)
    ORDER BY 
        price ASC NULLS LAST, distance_from_route ASC;
END;
$$ LANGUAGE plpgsql STABLE;
