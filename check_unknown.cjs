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
        routeGeometry: "}xbdI`}rK??", // simple short line
        fuelType: "E10",
        bufferMeters: 8046.72
    })
  });
  
  const data = await res.json();
  const weird = data.stations.filter(s => s.price > 0 && !s.recorded_at);
  console.log("Stations with price > 0 but NULL recorded_at:", weird.length);
  if (weird.length > 0) {
      console.log(weird[0]);
  }
}
run();
