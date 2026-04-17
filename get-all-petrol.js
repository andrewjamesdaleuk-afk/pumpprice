import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const MAJOR_CITIES = {
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
  'Southampton': { lat: 50.9025349, lon: -1.4041890 }
};

const safeUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co';
const safeKey = process.env.VITE_SUPABASE_ANON_KEY;

async function getStats(cityName, coords) {
    const linestringWKT = `SRID=4326;LINESTRING(${coords.lon} ${coords.lat}, ${coords.lon + 0.0001} ${coords.lat + 0.0001})`;
    
    const res = await fetch(`${safeUrl}/rest/v1/rpc/get_stations_along_route`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': safeKey,
            'Authorization': `Bearer ${safeKey}`
        },
        body: JSON.stringify({
            route_line: linestringWKT,
            buffer_meters: 8046.72,
            target_fuel_type: 'E10'
        })
    });
    
    const stations = await res.json();
    const prices = stations.map(s => s.price).filter(p => p > 0);
    if (prices.length === 0) return null;
    
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { avg: avg.toFixed(1), count: prices.length };
}

async function run() {
    console.log('--- Real-time Petrol (E10) Averages ---');
    for (const [name, coords] of Object.entries(MAJOR_CITIES)) {
        const stats = await getStats(name, coords);
        if (stats) {
            console.log(`${name.padEnd(15)}: ${stats.avg}p (${stats.count} stations)`);
        } else {
            console.log(`${name.padEnd(15)}: No data`);
        }
    }
}

run();
