DROP FUNCTION IF EXISTS get_stations_along_route(GEOGRAPHY, FLOAT, VARCHAR);

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
    recorded_at TIMESTAMPTZ,
    distance_from_route FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH route_stations AS (
        SELECT 
            s.id,
            s.site_id,
            s.brand,
            s.postcode,
            s.location,
            ST_Distance(s.location, route_line) AS distance_from_route
        FROM 
            stations s
        WHERE 
            ST_DWithin(s.location, route_line, buffer_meters)
    )
    SELECT 
        rs.id AS station_id,
        rs.site_id,
        rs.brand,
        rs.postcode,
        ST_Y(rs.location::geometry) AS lat,
        ST_X(rs.location::geometry) AS lon,
        p.price,
        p.recorded_at,
        rs.distance_from_route
    FROM 
        route_stations rs
    JOIN LATERAL (
        SELECT price, recorded_at 
        FROM prices 
        WHERE station_id = rs.id AND fuel_type = target_fuel_type
        ORDER BY recorded_at DESC 
        LIMIT 1
    ) p ON true
    ORDER BY 
        p.price ASC NULLS LAST, rs.distance_from_route ASC;
END;
$$ LANGUAGE plpgsql STABLE;
