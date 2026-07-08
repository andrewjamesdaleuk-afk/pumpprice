const fetch = require('node-fetch');

const clientId = '3OO0Y5G1XXMyWXDwvL8bgLynHNhqpn6S';
const clientSecret = 'k284SMk2nEpSBKHypSvex3UKup1daylnUiTr2fYjjBTBWIjIRAET1AuOCo8sLgiS';

async function run() {
    try {
        const tokenRes = await fetch('https://www.developer.fuel-finder.service.gov.uk/api/v1/oauth/generate_access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            })
        });
        const tokenResult = await tokenRes.json();
        const token = tokenResult.data.access_token;

        if (token) {
            let batch = 1;
            while (batch < 10) {
                const res = await fetch(`https://www.developer.fuel-finder.service.gov.uk/api/v1/pfs/fuel-prices?batch-number=${batch}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`Batch ${batch}: ${data.length} items`);
                    batch++;
                } else {
                    console.log(`Batch ${batch}: End of data (length ${data?.length || 0})`);
                    break;
                }
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
