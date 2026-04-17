-- Phase 1: Pumpprice Supabase & PostGIS Schema

-- Enable PostGIS extension for spatial data (stations locations)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: stations
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id VARCHAR(100) UNIQUE NOT NULL, -- ID from GOV.UK API
  brand VARCHAR(255) NOT NULL,
  postcode VARCHAR(20),
  location GEOGRAPHY(Point, 4326) NOT NULL, -- Spatial point (lon, lat)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for spatial queries (finding stations along a polyline buffer)
CREATE INDEX IF NOT EXISTS stations_location_idx ON stations USING GIST (location);

-- Table: prices
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  fuel_type VARCHAR(50) NOT NULL, -- e.g., 'B7', 'E10', 'E5', 'SDV'
  price NUMERIC(10, 2) NOT NULL, -- Price in pence per litre
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(station_id, fuel_type, recorded_at)
);

-- Index for fast price lookups
CREATE INDEX IF NOT EXISTS prices_station_fuel_idx ON prices (station_id, fuel_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update stations.updated_at
CREATE TRIGGER update_stations_modtime
BEFORE UPDATE ON stations
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
-- Routing RPC for Pumpprice
-- Input: Polyline geography and buffer radius (meters)
-- Output: Stations within the buffer with their latest prices
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
    distance_from_route FLOAT
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
        ST_Distance(s.location, route_line) AS distance_from_route
    FROM 
        stations s
    WHERE 
        ST_DWithin(s.location, route_line, buffer_meters)
    ORDER BY 
        price ASC NULLS LAST, distance_from_route ASC;
END;
$$ LANGUAGE plpgsql STABLE;
