import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const FR_API_URL = "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";

serve(async (req) => {
    try {
        let totalStationsProcessed = 0;
        let totalPricesProcessed = 0;

        // The French API allows large limits, but let's page through just in case
        let offset = 0;
        const limit = 100; 
        let hasMore = true;

        while (hasMore) {
            console.log(`Fetching FR stations from offset ${offset}...`);
            const response = await fetch(`${FR_API_URL}?limit=${limit}&offset=${offset}`);
            if (!response.ok) throw new Error(`FR API failed: ${response.status}`);
            
            const data = await response.json();
            const results = data.results || [];
            
            if (results.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`Processing ${results.length} FR stations...`);

            // 1. Map Stations
            const stationsPayload = results
                .filter(r => r.geom && r.geom.lon !== undefined)
                .map(r => ({
                    site_id: `FR_${r.id}`,
                    brand: r.ville ? `${r.ville} Station` : 'French Station', // The official API omits brand names. Using City as fallback for now.
                    postcode: r.cp || '',
                    address: `${r.adresse || ''}, ${r.ville || ''}`.trim(),
                    location: `SRID=4326;POINT(${r.geom.lon} ${r.geom.lat})`,
                    country_code: 'FR'
                }));

            const { data: stDataArray, error: stError } = await supabase
                .from('stations')
                .upsert(stationsPayload, { onConflict: 'site_id' })
                .select('id, site_id');

            if (stError || !stDataArray) {
                console.error(`Batch upsert error:`, JSON.stringify(stError));
                offset += limit;
                continue;
            }

            totalStationsProcessed += stationsPayload.length;
            const idMap = new Map(stDataArray.map(st => [st.site_id, st.id]));

            // 2. Map Prices
            const pricesPayload = [];
            const fuelMap = {
                'gazole': 'B7',
                'e10': 'E10',
                'sp95': 'E5',
                'sp98': 'SDV',
                'e85': 'E85',
                'gplc': 'GPLc'
            };

            for (const r of results) {
                const internalId = idMap.get(`FR_${r.id}`);
                if (!internalId) continue;

                for (const [key, label] of Object.entries(fuelMap)) {
                    const price = r[`${key}_prix`];
                    const updatedAt = r[`${key}_maj`];
                    
                    if (price) {
                        pricesPayload.push({
                            station_id: internalId,
                            fuel_type: label,
                            price: Number(price) * 100, // Convert Euros to Cents (matching our UK pence logic)
                            recorded_at: updatedAt || new Date().toISOString()
                        });
                    }
                }
            }

            if (pricesPayload.length > 0) {
                const { error: prError } = await supabase
                    .from('prices')
                    .upsert(pricesPayload, { onConflict: 'station_id, fuel_type, recorded_at', ignoreDuplicates: true });
                
                if (!prError) totalPricesProcessed += pricesPayload.length;
            }

            offset += limit;
            // Safety break - France has ~10k stations, let's process 5k at a time to stay safe with execution limits
            if (offset >= 5000) hasMore = false; 
        }

        console.log("Triggering refresh_insights_for_country('FR')...");
        await supabase.rpc('refresh_insights_for_country', { target_country: 'FR' });

        return new Response(JSON.stringify({ 
            success: true, 
            stations: totalStationsProcessed,
            prices: totalPricesProcessed
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("Handler error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});
