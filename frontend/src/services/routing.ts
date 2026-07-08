import polyline from '@mapbox/polyline';

export interface RouteData {
  geometry: string; // Polyline encoded string
  waypoints: [number, number][]; // [lon, lat]
  distance: number; // meters
  duration: number; // seconds
}

export const geocodePostcode = async (postcode: string): Promise<[number, number] | null> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcode)}&format=json&countrycodes=gb,fr`);
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

export const fetchRoute = async (start: [number, number], end: [number, number]): Promise<RouteData | null> => {
  try {
    // OSRM (Open Source Routing Machine) public API
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch route');
    
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    
    return {
      geometry: route.geometry,
      waypoints: [start, end],
      distance: route.distance,
      duration: route.duration
    };
  } catch (error) {
    console.error("Routing error:", error);
    return null;
  }
};

export const decodeRoute = (geometry: string): [number, number][] => {
    // returns array of [lat, lon] for Leaflet
    return polyline.decode(geometry);
};
