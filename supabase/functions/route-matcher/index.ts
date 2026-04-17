import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import polyline from "https://esm.sh/@mapbox/polyline@1.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { routeGeometry, fuelType = "E10", bufferMeters = 804.672 } = await req.json();

    if (!routeGeometry) {
      return new Response(
        JSON.stringify({ error: "Missing routeGeometry" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Decode the polyline to coordinates and format as a PostGIS LineString WKT
    const decoded = polyline.decode(routeGeometry);
    const wktCoordinates = decoded.map((coord: [number, number]) => `${coord[1]} ${coord[0]}`).join(', ');
    const linestringWKT = `SRID=4326;LINESTRING(${wktCoordinates})`;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call PostGIS RPC with the requested buffer radius
    const { data: stations, error } = await supabaseClient.rpc("get_stations_along_route", {
      route_line: linestringWKT,
      buffer_meters: bufferMeters,
      target_fuel_type: fuelType
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        route_polyline: routeGeometry,
        stations: stations
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
