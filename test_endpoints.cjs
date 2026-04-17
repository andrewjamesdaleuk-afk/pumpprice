const ALL_CMA_ENDPOINTS = [
    "https://storelocator.asda.com/fuel_prices_data.json",
    "https://www.morrisons.com/fuel-prices/fuel.json",
    "https://fuelprices.esso.co.uk/latestdata.json",
    "https://www.bp.com/en_gb/united-kingdom/home/fuelprices/fuel_prices_data.json",
    "https://www.tesco.com/fuel_prices/fuel_prices_data.json",
    "https://www.shell.co.uk/fuel-prices-data.html"
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
            console.log(`Status: ${response.status} ${response.statusText}`);
            if (response.ok) {
                const text = await response.text();
                if (text.length > 1000) {
                     console.log(`Success: Received ${text.length} bytes.`);
                } else {
                     console.log(`Success, but body is short: ${text.substring(0, 100)}...`);
                }
            } else {
                console.log(`Failed response body: ${await response.text().catch(()=>'could not read text')}`);
            }
        } catch (e) {
            console.error(`Fetch exception:`, e.message);
        }
    }
}
run();
