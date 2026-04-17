import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALL_CMA_ENDPOINTS = [
    "https://www.tesco.com/fuel_prices/fuel_prices_data.json",
    "https://storelocator.asda.com/fuel_prices_data.json",
    "https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json",
    "https://www.morrisons.com/fuel-prices/fuel.json",
    "https://fuelprices.asconagroup.co.uk/newfuel.json",
    "https://www.bp.com/en_gb/united-kingdom/home/fuelprices/fuel_prices_data.json",
    "https://fuelprices.esso.co.uk/latestdata.json",
    "https://jetlocal.co.uk/fuel_prices_data.json",
    "https://moto-way.com/fuel-price/fuel_prices.json",
    "https://fuel.motorfuelgroup.com/fuel_prices_data.json",
    "https://www.rontec-servicestations.co.uk/fuel-prices/data/fuel_prices_data.json",
    "https://www.sgnretail.uk/files/data/SGN_daily_fuel_prices.json",
    "https://www.shell.co.uk/fuel-prices-data.html"
];

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('CUSTOM_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

function parseCmaDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    try {
        const parts = dateStr.split(' ');
        if (parts.length >= 2) {
            const dateParts = parts[0].split('/');
            if (dateParts.length === 3) {
                const [dd, mm, yyyy] = dateParts;
                return new Date(`${yyyy}-${mm}-${dd}T${parts[1]}Z`).toISOString();
            }
        }
    } catch (e) {
        // ignore and fallback
    }
    return new Date().toISOString();
}

serve(async (req) => {
    try {
        let totalStationsProcessed = 0;
        let totalPricesProcessed = 0;

        // Fetch concurrently with realistic headers to bypass Akamai/Cloudflare WAFs
        const fetchPromises = ALL_CMA_ENDPOINTS.map(async (url) => {
            console.log(`Fetching from ${url}...`);
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            }
            const cmaJson = await response.json();
            return { url, json: cmaJson };
        });

        const fetchResults = await Promise.allSettled(fetchPromises);

        // Process sequentially to avoid worker resource exhaustion
        for (const result of fetchResults) {
            if (result.status !== 'fulfilled') {
                console.error('Fetch error:', result.reason);
                continue;
            }

            const { url, json: cmaJson } = result.value;
            const stations = cmaJson.stations || [];
            const recordedAt = parseCmaDate(cmaJson.last_updated);
            
            console.log(`Found ${stations.length} stations from ${url}. Upserting...`);

            const BATCH_SIZE = 100;
            for (let i = 0; i < stations.length; i += BATCH_SIZE) {
                const batch = stations.slice(i, i + BATCH_SIZE);
                
                const stationsPayload = batch
                    .filter(s => s.location && s.location.longitude !== undefined && s.location.latitude !== undefined)
                    .map(s => ({
                        site_id: String(s.site_id),
                        brand: s.brand || 'Unknown',
                        postcode: s.postcode || '',
                        address: s.address || '',
                        location: `SRID=4326;POINT(${s.location.longitude} ${s.location.latitude})`
                    }));

                if (stationsPayload.length === 0) continue;

                // Upsert stations
                const { data: stDataArray, error: stError } = await supabase
                    .from('stations')
                    .upsert(stationsPayload, { onConflict: 'site_id' })
                    .select('id, site_id');

                if (stError || !stDataArray) {
                    console.error(`Batch upsert error for ${url}:`, JSON.stringify(stError));
                    continue;
                }

                totalStationsProcessed += stationsPayload.length;

                // Map site_id -> internal id
                const idMap = new Map(stDataArray.map(st => [st.site_id, st.id]));

                // Prepare prices
                const pricesPayload = [];
                for (const s of batch) {
                    const stationId = idMap.get(String(s.site_id));
                    if (!stationId || !s.prices || typeof s.prices !== 'object') continue;
                    
                    for (const [fuel_type, price] of Object.entries(s.prices)) {
                        pricesPayload.push({
                            station_id: stationId,
                            fuel_type: fuel_type,
                            price: Number(price),
                            recorded_at: recordedAt
                        });
                    }
                }

                if (pricesPayload.length > 0) {
                    const { error: prError } = await supabase
                        .from('prices')
                        .insert(pricesPayload);
                        
                    if (prError && !prError.message.includes('duplicate key value')) {
                        console.error(`Prices batch insert error for ${url}:`, JSON.stringify(prError));
                    } else {
                        totalPricesProcessed += pricesPayload.length;
                    }
                }
            }
        }

        // Trigger the insights refresh to sync the frontend cards with the new data
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
