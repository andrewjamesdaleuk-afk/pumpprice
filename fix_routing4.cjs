require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');

async function run() {
  console.log("Checking what the route-matcher is currently returning...");
  
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/route-matcher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    // Coordinates for leeds to slightly north of leeds
    body: JSON.stringify({
        routeGeometry: "}xbdI`}rK??", // simple short line
        fuelType: "E10",
        bufferMeters: 8046.72
    })
  });
  
  const data = await res.json();
  if (data.stations && data.stations.length > 0) {
      console.log("Sample station:", data.stations[0]);
  } else {
      console.log("Response:", data);
  }
}
run();
