const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching raw data to calculate locally...");
    
    // Petrol
    const { data: pData, error: pErr } = await supabase
        .from('prices')
        .select('price, station_id, stations(brand, postcode)')
        .eq('fuel_type', 'E10')
        .gte('price', 145)
        .lte('price', 199)
        .gt('recorded_at', new Date(Date.now() - 24*60*60*1000).toISOString());
        
    if (pErr) { console.error(pErr); return; }
    
    // Diesel
    const { data: dData, error: dErr } = await supabase
        .from('prices')
        .select('price, station_id, stations(brand, postcode)')
        .eq('fuel_type', 'B7')
        .gte('price', 160)
        .lte('price', 210)
        .gt('recorded_at', new Date(Date.now() - 24*60*60*1000).toISOString());
        
    if (dErr) { console.error(dErr); return; }
    
    if (!pData || pData.length === 0 || !dData || dData.length === 0) {
        console.log("Not enough data to calculate averages");
        return;
    }
    
    pData.sort((a,b) => a.price - b.price);
    dData.sort((a,b) => a.price - b.price);
    
    const p_avg = Math.floor(pData.reduce((acc, val) => acc + val.price, 0) / pData.length) + 0.9;
    const p_low = pData[0];
    const p_high = pData[pData.length - 1];
    
    const d_avg = Math.floor(dData.reduce((acc, val) => acc + val.price, 0) / dData.length) + 0.9;
    const d_low = dData[0];
    const d_high = dData[dData.length - 1];
    
    const stationIds = new Set([...pData.map(d=>d.station_id), ...dData.map(d=>d.station_id)]);
    const total_stations = stationIds.size;
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`Inserting data for ${today}: P Avg ${p_avg}, D Avg ${d_avg}, Stations ${total_stations}`);
    
    const { error: insErr } = await supabase.from('uk_price_history').upsert({
        date: today,
        petrol_avg: p_avg,
        petrol_low: p_low.price,
        petrol_high: p_high.price,
        petrol_low_brand: p_low.stations.brand,
        petrol_low_address: p_low.stations.postcode,
        petrol_high_brand: p_high.stations.brand,
        petrol_high_address: p_high.stations.postcode,
        diesel_avg: d_avg,
        diesel_low: d_low.price,
        diesel_high: d_high.price,
        diesel_low_brand: d_low.stations.brand,
        diesel_low_address: d_low.stations.postcode,
        diesel_high_brand: d_high.stations.brand,
        diesel_high_address: d_high.stations.postcode,
        sample_size: total_stations
    });
    
    if (insErr) { console.error("Insert Error:", insErr); }
    else { console.log("Successfully inserted today's data!"); }
}
run();
