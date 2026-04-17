const fetch = require('node-fetch');
async function run() {
    try {
        const response = await fetch("https://storelocator.asda.com/fuel_prices_data.json");
        const json = await response.json();
        const missingLoc = json.stations.filter(s => !s.location || s.location.longitude === undefined || s.location.latitude === undefined);
        console.log(`Asda stations with NO location: ${missingLoc.length}`);
        
        const siteIds = json.stations.map(s => s.site_id);
        const uniqueSiteIds = new Set(siteIds);
        console.log(`Total site IDs: ${siteIds.length}`);
        console.log(`Unique site IDs: ${uniqueSiteIds.size}`);
    } catch (e) {
        console.error(e);
    }
}
run();
