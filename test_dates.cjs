const ALL_CMA_ENDPOINTS = [
    "https://storelocator.asda.com/fuel_prices_data.json",
    "https://www.morrisons.com/fuel-prices/fuel.json",
    "https://fuelprices.esso.co.uk/latestdata.json",
];

async function run() {
    for (const url of ALL_CMA_ENDPOINTS) {
        console.log(`\nTesting ${url}...`);
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
                }
            });
            if (response.ok) {
                const json = await response.json();
                console.log(`last_updated for ${url}:`, json.last_updated);
            }
        } catch (e) {
            console.error(`Fetch exception:`, e.message);
        }
    }
}
run();
