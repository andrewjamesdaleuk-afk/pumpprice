import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('CUSTOM_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const FUEL_FINDER_CLIENT_ID = Deno.env.get('FUEL_FINDER_CLIENT_ID') || '';
const FUEL_FINDER_CLIENT_SECRET = Deno.env.get('FUEL_FINDER_CLIENT_SECRET') || '';

async function getAccessToken() {
    console.log("Fetching new Fuel Finder access token...");
    const res = await fetch('https://www.developer.fuel-finder.service.gov.uk/api/v1/oauth/generate_access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: FUEL_FINDER_CLIENT_ID,
            client_secret: FUEL_FINDER_CLIENT_SECRET,
            grant_type: 'client_credentials'
        })
    });
    
    if (!res.ok) {
        throw new Error(`Failed to get token: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return data.data.access_token;
}

// Map the new API's fuel types to our existing schema fuel types
const FUEL_TYPE_MAP: Record<string, string> = {
    'B7_STANDARD': 'B7',
    'B7_PREMIUM': 'SDV',
    'E10': 'E10',
    'E5': 'E5'
};

serve(async (req) => {
    try {
        if (!FUEL_FINDER_CLIENT_ID || !FUEL_FINDER_CLIENT_SECRET) {
             throw new Error("Missing FUEL_FINDER credentials in environment variables.");
        }

        let totalStationsProcessed = 0;
        let totalPricesProcessed = 0;

        const token = await getAccessToken();

        let batchNumber = 1;
        let hasMoreData = true;

        while (hasMoreData) {
            console.log(`Fetching batch ${batchNumber} of stations from Fuel Finder API...`);
            
            const stationRes = await fetch(`https://www.developer.fuel-finder.service.gov.uk/api/v1/pfs?batch-number=${batchNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!stationRes.ok) {
                if (stationRes.status === 400 || stationRes.status === 404) {
                     // Probably end of batches
                     hasMoreData = false;
                     break;
                }
                throw new Error(`Failed to fetch stations batch ${batchNumber}: ${stationRes.status}`);
            }

            let stations = await stationRes.json();
            
            // The API response might wrap the array in a data object depending on exact endpoint structure
            if (stations.data && Array.isArray(stations.data)) stations = stations.data;
            if (stations.pfs && Array.isArray(stations.pfs)) stations = stations.pfs;
            if (stations.stations && Array.isArray(stations.stations)) stations = stations.stations;

            if (!Array.isArray(stations) || stations.length === 0) {
                console.log(`No more stations found in batch ${batchNumber}.`);
                hasMoreData = false;
                break;
            }

            console.log(`Found ${stations.length} stations in batch ${batchNumber}. Upserting...`);

            // 1. Process Stations Metadata
            const stationsPayload = stations
                .filter(s => s.location && s.location.longitude !== undefined && s.location.latitude !== undefined)
                .map(s => ({
                    site_id: s.node_id,
                    brand: s.brand_name || s.trading_name || 'Unknown',
                    postcode: s.location.postcode || '',
                    address: [s.location.address_line_1, s.location.address_line_2, s.location.city].filter(Boolean).join(', '),
                    location: `SRID=4326;POINT(${s.location.longitude} ${s.location.latitude})`
                }));

            if (stationsPayload.length === 0) {
                batchNumber++;
                continue;
            }

            const { data: stDataArray, error: stError } = await supabase
                .from('stations')
                .upsert(stationsPayload, { onConflict: 'site_id' })
                .select('id, site_id');

            if (stError || !stDataArray) {
                console.error(`Batch upsert error:`, JSON.stringify(stError));
                batchNumber++;
                continue;
            }

            totalStationsProcessed += stationsPayload.length;
            const idMap = new Map(stDataArray.map(st => [st.site_id, st.id]));

            // 2. Process Prices for this batch
            console.log(`Fetching prices for batch ${batchNumber}...`);
            const priceRes = await fetch(`https://www.developer.fuel-finder.service.gov.uk/api/v1/pfs/fuel-prices?batch-number=${batchNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (priceRes.ok) {
                 let pricesBatch = await priceRes.json();
                 if (pricesBatch.data && Array.isArray(pricesBatch.data)) pricesBatch = pricesBatch.data;
                 if (pricesBatch.pfs && Array.isArray(pricesBatch.pfs)) pricesBatch = pricesBatch.pfs;
                 
                 const pricesPayload = [];
                 
                 for (const s of pricesBatch) {
                     const stationId = idMap.get(s.node_id);
                     if (!stationId || !s.fuel_prices) continue;
                     
                     for (const fp of s.fuel_prices) {
                         const mappedFuelType = FUEL_TYPE_MAP[fp.fuel_type] || fp.fuel_type;
                         if (fp.price) {
                             pricesPayload.push({
                                 station_id: stationId,
                                 fuel_type: mappedFuelType,
                                 price: Number(fp.price),
                                 recorded_at: fp.price_last_updated || new Date().toISOString()
                             });
                         }
                     }
                 }

                 if (pricesPayload.length > 0) {
                     const { error: prError } = await supabase
                         .from('prices')
                         .upsert(pricesPayload, { onConflict: 'station_id, fuel_type, recorded_at', ignoreDuplicates: true });
                         
                     if (prError) {
                         console.error(`Prices batch insert error:`, JSON.stringify(prError));
                     } else {
                         totalPricesProcessed += pricesPayload.length;
                     }
                 }
            } else {
                console.error(`Failed to fetch prices for batch ${batchNumber}: ${priceRes.status}`);
            }

            batchNumber++;
        }

        console.log("Triggering refresh_all_insights RPC...");
        await supabase.rpc('refresh_all_insights');

        return new Response(JSON.stringify({ 
            success: true, 
            stations: totalStationsProcessed,
            prices: totalPricesProcessed
        }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Handler error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});
