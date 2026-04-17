require('dotenv').config();

const CLIENT_ID = process.env.FUEL_CLIENT_ID;
const CLIENT_SECRET = process.env.FUEL_CLIENT_SECRET;

// One more guess based on GOV.UK API standards
const TOKEN_URL = "https://auth.fuel-finder.service.gov.uk/oauth2/token"; 
const ALT_TOKEN_URL = "https://identity.fuel-finder.service.gov.uk/oauth2/token";
const ALT2_TOKEN_URL = "https://sandbox-identity.fuel-finder.service.gov.uk/oauth2/token";

async function testConnection() {
    console.log("Attempting to get OAuth token...");
    const urls = [
        "https://www.fuel-finder.service.gov.uk/api/v1/oauth/generate_access_token"
    ];

    for (const url of urls) {
        console.log(`Trying Token URL: ${url}`);
        try {
            const tokenResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    scope: 'fuelfinder.read' // from the docs
                })
            });

            if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                
                const token = tokenData?.data?.access_token;
                
                if (token) {
                    console.log("✅ Token received:", token.substring(0, 20) + "...");
                    
                    const priceUrls = [
                        "https://www.fuel-finder.service.gov.uk/api/v1/pfs/fuel-prices?batch-number=1",
                        "https://www.fuel-finder.service.gov.uk/api/v1/pfs/prices?batch-number=1"
                    ];
                    
                    for (const pUrl of priceUrls) {
                        const success = await fetchPrices(token, pUrl);
                        if (success) break;
                    }
                } else {
                    console.error("Could not extract token from response.", tokenData);
                }
                return;
            } else {
               console.error(`❌ Failed (${tokenResponse.status}):`, await tokenResponse.text());
            }
        } catch (e) {
            console.error(`❌ Network Error for ${url}:`, e.message);
        }
    }
}

async function fetchPrices(token, url) {
    console.log(`\nFetching prices from ${url}...`);
    try {
        const priceResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!priceResponse.ok) {
            console.error(`Price Fetch Failed (${priceResponse.status}):`, await priceResponse.text());
            return false;
        }

        const data = await priceResponse.json();
        console.log("✅ Data received! First object fully:");
        console.log(JSON.stringify(data[0] || data, null, 2));
        
        // Are there prices in this object?
        const hasPrices = JSON.stringify(data[0]).includes('price');
        console.log("Contains 'price' keyword?", hasPrices);
        return true;
    } catch (e) {
        console.error(`Network Error: ${e.message}`);
        return false;
    }
}

testConnection();
