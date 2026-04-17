CREATE OR REPLACE FUNCTION get_optimal_route(
  start_lat FLOAT,
  start_lon FLOAT,
  end_lat FLOAT,
  end_lon FLOAT
) RETURNS json AS $$
DECLARE
  route_result json;
BEGIN
  -- Simple routing query using pgRouting / PostGIS
  SELECT row_to_json(r) INTO route_result
  FROM (
    SELECT
      seq,
      node,
      edge,
      cost,
      agg_cost
    FROM pgr_dijkstra(
      'SELECT id, source, target, cost, reverse_cost FROM ways',
      (SELECT id FROM ways_vertices_pgr ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(start_lon, start_lat), 4326) LIMIT 1),
      (SELECT id FROM ways_vertices_pgr ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(end_lon, end_lat), 4326) LIMIT 1),
      directed := true
    )
  ) r;
  
  RETURN route_result;
END;
$$ LANGUAGE plpgsql;