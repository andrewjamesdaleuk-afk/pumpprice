const fetch = require('node-fetch');

async function run() {
    try {
        const response = await fetch("https://storelocator.asda.com/fuel_prices_data.json");
        const json = await response.json();
        let missingCount = 0;
        
        for (const station of json.stations) {
            if (!station.prices || (!station.prices.E10 && !station.prices.B7 && !station.prices.E5)) {
                missingCount++;
            }
        }
        console.log(`Asda total stations: ${json.stations.length}`);
        console.log(`Asda stations with NO E10, E5, or B7: ${missingCount}`);
    } catch (e) {
        console.error(e);
    }
}
run();
