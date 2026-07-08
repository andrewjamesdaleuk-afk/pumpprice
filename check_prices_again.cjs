require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');

async function run() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/route-matcher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
        routeGeometry: "}xbdI`}rK??", // leeds
        fuelType: "E10",
        bufferMeters: 8046.72
    })
  });
  
  const data = await res.json();
  const nullDates = data.stations.filter(s => !s.recorded_at);
  console.log("Total stations from matcher:", data.stations.length);
  console.log("Stations with NULL recorded_at:", nullDates.length);
  if (nullDates.length > 0) {
      console.log("Sample null station:", nullDates[0]);
  } else if (data.stations.length > 0) {
      console.log("Sample good station:", data.stations[0]);
  }
}
run();
