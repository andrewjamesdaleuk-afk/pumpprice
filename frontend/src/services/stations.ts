import polyline from '@mapbox/polyline';


export interface Station {
  site_id: string;
  brand: string;
  address: string;
  postcode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  price?: number; // Flat price returned by RPC
  recorded_at?: string; // Timestamp from the prices table
  distance_from_route?: number;
  lat?: number;
  lon?: number;
  is_motorway?: boolean;
  country_code?: string;
}

const requestQueue: (() => Promise<void>)[] = [];
let activeRequests = 0;
const MAX_CONCURRENT = 2;

const processQueue = async () => {
  if (activeRequests >= MAX_CONCURRENT || requestQueue.length === 0) return;
  activeRequests++;
  const task = requestQueue.shift();
  if (task) {
    try {
      await task();
    } finally {
      activeRequests--;
      processQueue();
    }
  }
};

const executeWithConcurrencyLimit = <T>(task: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        resolve(await task());
      } catch (err) {
        reject(err);
      }
    });
    processQueue();
  });
};

export const fetchStationsNearRoute = async (routeGeometry: string, fuelType: 'petrol' | 'diesel', bufferMeters: number = 804.672): Promise<Station[]> => {
  return executeWithConcurrencyLimit(async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const safeUrl = supabaseUrl.includes('bdqmzhniwxsshxqorgnt') ? 'https://pvutijbggbbrobjlpwrp.supabase.co' : supabaseUrl;
      const safeKey = anonKey;

      const fuelTypeParam = fuelType === 'petrol' ? 'E10' : 'B7';
      
      const response = await fetch(`${safeUrl}/functions/v1/route-matcher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeKey}`,
        },
        body: JSON.stringify({
          routeGeometry,
          fuelType: fuelTypeParam,
          bufferMeters
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Route-matcher failed (${response.status}):`, errText);
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data.stations || [];

    } catch (error) {
      console.error('Error in fetchStationsNearRoute:', error);
      return [];
    }
  });
};

const MAJOR_CITIES: Record<string, {lat: number, lon: number}> = {
  'London': { lat: 51.5074456, lon: -0.1277653 },
  'Birmingham': { lat: 52.4796992, lon: -1.9026911 },
  'Glasgow': { lat: 55.8611550, lon: -4.2501687 },
  'Liverpool': { lat: 53.4071991, lon: -2.9916800 },
  'Bristol': { lat: 51.4538022, lon: -2.5972985 },
  'Manchester': { lat: 53.4794892, lon: -2.2451148 },
  'Sheffield': { lat: 53.3806626, lon: -1.4702278 },
  'Leeds': { lat: 53.7974185, lon: -1.5437941 },
  'Edinburgh': { lat: 55.9533456, lon: -3.1883749 },
  'Leicester': { lat: 52.6362000, lon: -1.1331969 },
  'Coventry': { lat: 52.4081812, lon: -1.5104770 },
  'Bradford': { lat: 53.7944229, lon: -1.7519186 },
  'Cardiff': { lat: 51.4816546, lon: -3.1791934 },
  'Belfast': { lat: 54.5975805, lon: -5.9277097 },
  'Nottingham': { lat: 52.9534193, lon: -1.1496461 },
  'Newcastle': { lat: 54.9738474, lon: -1.6131572 },
  'Southampton': { lat: 50.9025349, lon: -1.4041890 },
  'Brighton': { lat: 50.8225, lon: -0.1372 },
  'Oxford': { lat: 51.7520, lon: -1.2577 },
  'Cambridge': { lat: 52.2053, lon: 0.1218 }
};

export const fetchCityStats = async (postcodeOrCity: string, bufferMeters: number = 8046.72): Promise<{ petrol: any, diesel: any, petrolStations?: any[], dieselStations?: any[] } | null> => {
  try {
    let lat: number;
    let lon: number;

    if (MAJOR_CITIES[postcodeOrCity]) {
      lat = MAJOR_CITIES[postcodeOrCity].lat;
      lon = MAJOR_CITIES[postcodeOrCity].lon;
    } else {
      const coords = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcodeOrCity)}&format=json&countrycodes=gb`, { headers: { 'User-Agent': 'Pumpprice.live/1.0' } }).then(res => res.json());
      if (!coords || coords.length === 0) return null;
      lat = parseFloat(coords[0].lat); 
      lon = parseFloat(coords[0].lon); 
    }
    
    // Create a tiny route (start=end) to trick the route-matcher into doing a radius search
    const pointPolyline = polyline.encode([[lat, lon], [lat + 0.0001, lon + 0.0001]]);
    
    const [petrolStations, dieselStations] = await Promise.all([
      fetchStationsNearRoute(pointPolyline, 'petrol', bufferMeters),
      fetchStationsNearRoute(pointPolyline, 'diesel', bufferMeters)
    ]);
    
    const calcStats = (stations: any[]) => {
      const prices = stations.map(s => s.price).filter(p => p > 0);
      if (prices.length === 0) return null;
      return {
        avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(1),
        min: Math.min(...prices).toFixed(1),
        max: Math.max(...prices).toFixed(1),
        count: prices.length
      };
    };

    return {
      petrol: calcStats(petrolStations),
      diesel: calcStats(dieselStations),
      petrolStations,
      dieselStations
    };
  } catch (error) {
    console.error('Error fetching city stats:', error);
    return null;
  }
};



export interface HubStat {
  station: string;
  price: number;
  regionalAvg: number;
}


export const fetchHubStats = async (): Promise<HubStat[]> => {
  return [];
};

export interface DesertStat {
  region: string;
  price: number;
  premium: number;
  stationCount: number;
}

export const fetchFuelDeserts = async (): Promise<DesertStat[]> => {
  return [];
};

export interface MotorwayStat {
  motorway: string;
  services: string;
  price: number;
  penalty: number;
}

export const fetchExpensiveMotorways = async (): Promise<MotorwayStat[]> => {
  return [];
};

export interface RankedCityStat {
  city: string;
  price: number;
  diff: number;
}

export const fetchRankedCities = async (type: "cheapest" | "expensive", _fuelType: "E10" | "B7" = "E10"): Promise<RankedCityStat[]> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const safeUrl = supabaseUrl.includes('bdqmzhniwxsshxqorgnt') ? 'https://pvutijbggbbrobjlpwrp.supabase.co' : supabaseUrl;
    const safeKey = anonKey;

    const precomputedId = `${type}_cities_${_fuelType.toLowerCase()}`;
    const precomputedRes = await fetch(`${safeUrl}/rest/v1/precomputed_insights?id=eq.${precomputedId}&select=data`, {
      method: 'GET',
      headers: {
        'apikey': safeKey,
        'Authorization': `Bearer ${safeKey}`
      }
    });

    if (precomputedRes.ok) {
      const rows = await precomputedRes.json();
      if (rows && rows.length > 0 && rows[0].data && rows[0].data.length > 0) {
        return rows[0].data.map((d: any) => ({
          city: d.city,
          price: d.price,
          diff: d.diff
        }));
      }
    }
  } catch (e) {
    console.warn('Could not fetch from precomputed_insights for ranked cities', e);
  }

  // Fallback to empty if no data
  return [];
};


export interface RuralUrbanStat {
  area: string;
  rural: number;
  urban: number;
  difference: number;
}

export const fetchRuralUrbanStats = async (_fuelType: "petrol" | "diesel" = "petrol"): Promise<RuralUrbanStat[]> => {
  const regions = [
    { 
      name: 'Scotland', 
      urban: [{lat: 55.8642, lon: -4.2518}, {lat: 55.9533, lon: -3.1883}], 
      rural: [{lat: 57.4778, lon: -4.2247}, {lat: 56.8198, lon: -5.1052}] 
    },
    { 
      name: 'Wales', 
      urban: [{lat: 51.4816, lon: -3.1791}, {lat: 51.6214, lon: -3.9436}], 
      rural: [{lat: 52.59, lon: -3.84}, {lat: 52.95, lon: -3.61}] 
    },
    { 
      name: 'North England', 
      urban: [{lat: 53.4808, lon: -2.2426}, {lat: 53.7974, lon: -1.5438}], 
      rural: [{lat: 54.8925, lon: -2.9329}, {lat: 54.148, lon: -2.368}] 
    },
    { 
      name: 'SW England', 
      urban: [{lat: 51.4545, lon: -2.5879}, {lat: 50.3755, lon: -4.1427}], 
      rural: [{lat: 50.266, lon: -5.052}, {lat: 50.716, lon: -3.533}] 
    }
  ];
  
  const results: RuralUrbanStat[] = [];
  const ruralRadius = 16093.4; // 10 miles
  const urbanRadius = 8046.7; // 5 miles

  const promises = regions.map(async (region) => {
    try {
      let urbanPrices: number[] = [];
      for (const pt of region.urban) {
        const poly = polyline.encode([[pt.lat, pt.lon], [pt.lat + 0.0001, pt.lon + 0.0001]]);
        const stations = await fetchStationsNearRoute(poly, "petrol", urbanRadius);
        urbanPrices.push(...stations.map(s => s.price).filter((p): p is number => p !== undefined && p > 0));
      }
      
      let ruralPrices: number[] = [];
      for (const pt of region.rural) {
        const poly = polyline.encode([[pt.lat, pt.lon], [pt.lat + 0.0001, pt.lon + 0.0001]]);
        const stations = await fetchStationsNearRoute(poly, "petrol", ruralRadius);
        ruralPrices.push(...stations.map(s => s.price).filter((p): p is number => p !== undefined && p > 0));
      }
      
      if (urbanPrices.length > 0 && ruralPrices.length > 0) {
        const uAvg = urbanPrices.reduce((a, b) => a + b, 0) / urbanPrices.length;
        const rAvg = ruralPrices.reduce((a, b) => a + b, 0) / ruralPrices.length;
        results.push({
          area: region.name,
          urban: uAvg,
          rural: rAvg,
          difference: rAvg - uAvg
        });
      }
    } catch (e) {
      console.error('Error fetching region:', region.name, e);
    }
  });

  await Promise.all(promises);
  return results;
};

export interface MotorwayPenaltyStat {
  motorway: string;
  motorway_avg: number;
  national_avg: number;
  penalty: number;
}

export const fetchMotorwayPenalty = async (_fuelType: 'E10' | 'B7' = 'E10'): Promise<MotorwayPenaltyStat[]> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const safeUrl = supabaseUrl.includes('bdqmzhniwxsshxqorgnt') ? 'https://pvutijbggbbrobjlpwrp.supabase.co' : supabaseUrl;
    const safeKey = anonKey;

    const response = await fetch(`${safeUrl}/rest/v1/rpc/get_motorway_penalty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': safeKey,
        'Authorization': `Bearer ${safeKey}`
      },
      body: JSON.stringify({ target_fuel_type: _fuelType })
    });

    if (!response.ok) {
      console.error('Penalty fetch failed', response.status);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching motorway penalties:', error);
    return [];
  }
};

export interface OneMileStat {
  pair: string;
  expensive: number;
  cheap: number;
  gap: number;
}

export const fetchOneMileWinners = async (_fuelType: 'E10' | 'B7' = 'E10'): Promise<OneMileStat[]> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const safeUrl = supabaseUrl.includes('bdqmzhniwxsshxqorgnt') ? 'https://pvutijbggbbrobjlpwrp.supabase.co' : supabaseUrl;
    const safeKey = anonKey;

    const response = await fetch(`${safeUrl}/rest/v1/rpc/get_one_mile_winners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': safeKey,
        'Authorization': `Bearer ${safeKey}`
      },
      body: JSON.stringify({ target_fuel_type: _fuelType })
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    return [];
  }
};



export interface PremiumGapStat {
  brand: string;
  standard: number;
  premium: number;
  gap: number;
}

export const fetchPremiumGap = async (fuelType: 'petrol' | 'diesel' = 'petrol'): Promise<PremiumGapStat[]> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const safeUrl = supabaseUrl.includes('bdqmzhniwxsshxqorgnt') ? 'https://pvutijbggbbrobjlpwrp.supabase.co' : supabaseUrl;
    const safeKey = anonKey;

    const param = fuelType === 'petrol' ? 'E10' : 'B7';
    let data = null;

    // Try fetching from precomputed table first
    const precomputedId = `premium_gap_${param.toLowerCase()}`;
    try {
      const precomputedRes = await fetch(`${safeUrl}/rest/v1/precomputed_insights?id=eq.${precomputedId}&select=data`, {
        method: 'GET',
        headers: {
          'apikey': safeKey,
          'Authorization': `Bearer ${safeKey}`
        }
      });
      if (precomputedRes.ok) {
        const rows = await precomputedRes.json();
        if (rows && rows.length > 0 && rows[0].data && rows[0].data.length > 0) {
          data = rows[0].data;
        }
      }
    } catch (e) {
      console.warn('Could not fetch from precomputed_insights', e);
    }

    // Fallback to RPC if precomputed is empty or failed
    if (!data) {
      const response = await fetch(`${safeUrl}/rest/v1/rpc/get_premium_gap_by_brand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': safeKey,
          'Authorization': `Bearer ${safeKey}`
        },
        body: JSON.stringify({ target_fuel_type: param })
      });

      if (!response.ok) {
        console.warn('Premium gap fetch failed, returning empty');
        return [];
      }

      data = await response.json();
    }

    if (!data || data.length === 0) return [];
    return data;
  } catch (error) {
    console.error('Error fetching premium gap:', error);
    return [];
  }
};

function getFallbackPremiumGap(fuelType: string): PremiumGapStat[] {
  return [];
}

export interface SupermarketSweepStat {
  region: string;
  petrolAvg: number;
  dieselAvg: number;
  nationalPetrol: number;
  nationalDiesel: number;
}

export const fetchSupermarketSweep = async (_fuelType: 'E10' | 'B7' = 'E10'): Promise<SupermarketSweepStat[]> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const safeUrl = supabaseUrl.includes('bdqmzhniwxsshxqorgnt') ? 'https://pvutijbggbbrobjlpwrp.supabase.co' : supabaseUrl;
    const safeKey = anonKey;

    const response = await fetch(`${safeUrl}/rest/v1/rpc/get_supermarket_sweep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': safeKey,
        'Authorization': `Bearer ${safeKey}`
      },
      body: JSON.stringify({ target_fuel_type: _fuelType })
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data || []).map((d: any) => ({
      region: d.region,
      petrolAvg: d.petrolavg,
      dieselAvg: d.dieselavg,
      nationalPetrol: d.nationalpetrol,
      nationalDiesel: d.nationaldiesel
    }));
  } catch (error) {
    return [];
  }
};

export interface BrandStat {
  brand: string;
  price: number;
  station_count: number;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

export const fetchBrandLeaderboard = async (_fuelType: 'E10' | 'B7' = 'E10'): Promise<BrandStat[]> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const safeUrl = supabaseUrl.includes('bdqmzhniwxsshxqorgnt') ? 'https://pvutijbggbbrobjlpwrp.supabase.co' : supabaseUrl;
    const safeKey = anonKey;

    // Try precomputed table first
    const precomputedId = `brand_leaderboard_${_fuelType.toLowerCase()}`;
    let data = null;

    try {
      const precomputedRes = await fetch(`${safeUrl}/rest/v1/precomputed_insights?id=eq.${precomputedId}&select=data`, {
        method: 'GET',
        headers: {
          'apikey': safeKey,
          'Authorization': `Bearer ${safeKey}`
        }
      });
      if (precomputedRes.ok) {
        const rows = await precomputedRes.json();
        if (rows && rows.length > 0 && rows[0].data && rows[0].data.length > 0) {
          data = rows[0].data;
        }
      }
    } catch (e) {
      console.warn('Could not fetch from precomputed_insights', e);
    }

    // Fallback to RPC if precomputed is empty or failed
    if (!data) {
      const response = await fetch(`${safeUrl}/rest/v1/rpc/get_brand_leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': safeKey,
          'Authorization': `Bearer ${safeKey}`
        },
        body: JSON.stringify({ target_fuel_type: _fuelType })
      });

      if (!response.ok) {
        console.warn('Brand Leaderboard fetch failed, returning fallback data');
        return [];
      }

      data = await response.json();
    }

    if (!data || data.length === 0) return [];

    return data.map((d: any) => ({
      brand: d.brand,
      price: d.price,
      station_count: d.station_count,
      trend: 'stable',
      change: 0
    }));
  } catch (error) {
    console.error('Error fetching brand leaderboard:', error);
    return [];
  }
};

