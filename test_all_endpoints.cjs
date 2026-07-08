const ALL_CMA_ENDPOINTS = [
    "https://www.tesco.com/fuel_prices/fuel_prices_data.json",
    "https://storelocator.asda.com/fuel_prices_data.json",
    "https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json",
    "https://www.morrisons.com/fuel-prices/fuel.json",
    "https://fuelprices.asconagroup.co.uk/newfuel.json",
    "https://www.bp.com/en_gb/united-kingdom/home/fuelprices/fuel_prices_data.json",
    "https://fuelprices.esso.co.uk/latestdata.json",
    "https://jetlocal.co.uk/fuel_prices_data.json",
    "https://moto-way.com/fuel-price/fuel_prices.json",
    "https://fuel.motorfuelgroup.com/fuel_prices_data.json",
    "https://www.rontec-servicestations.co.uk/fuel-prices/data/fuel_prices_data.json",
    "https://www.sgnretail.uk/files/data/SGN_daily_fuel_prices.json",
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
        } catch (e) {
            console.error(`Fetch exception:`, e.message);
        }
    }
}
run();
